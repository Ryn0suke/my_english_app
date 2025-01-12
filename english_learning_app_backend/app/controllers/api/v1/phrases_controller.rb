module Api
  module V1
    class PhrasesController < ApplicationController
      before_action :authenticate_api_v1_user!
      before_action :correct_user, only: [:destroy, :update]

      # GET /api/v1/phrases/:id
      # 指定されたユーザーのフレーズを取得する関数
      # phrase.rbで実装されているsearchメソッドで、条件付きの検索が可能
      # パラメータの例：GET /api/v1/phrases/1?page=1&search[japanese]=&search[english]=&search[tags][0][name]=&search[isPartialMatch]=true
      def show
        @user = User.find(params[:id])

        # N+1問題に対処するために、tags, checkをあらかじめ読み込んでおく
        # https://railsguides.jp/active_record_querying.html#%E8%A4%87%E6%95%B0%E3%81%AE%E9%96%A2%E9%80%A3%E4%BB%98%E3%81%91%E3%82%92eager-loading%E3%81%99%E3%82%8B

        # phrase.rbのsearchメソッドを呼び、条件付き検索を行う
        @phrases = @user.phrases
                        .includes(:tags, :check)
                        .search(params)
                        .page(params[:page])
                        .per(10)
        
        #検索結果をリストにしてフロントエンドに返す
        phrases_with_tags = @phrases.map do |phrase|
          state = phrase.check
          state1, state2, state3 = state[:state1], state[:state2], state[:state3]
          {
            id: phrase.id,
            japanese: phrase.japanese,
            english: phrase.english,
            tags: phrase.tags,
            state1: state1,
            state2: state2,
            state3: state3,
          }
        end
        render json: { total_pages: @phrases.total_pages, phrases: phrases_with_tags }
      end


      # POST /api/v1/phrases
      # 新しいフレーズを作成する関数
      # 登録するタグの中で、すでにTagテーブルに存在するものについては登録しない
      # paramsの例
      # Parameters: {"id"=>1, "japanese"=>"ねこ", "english"=>"cat", "state1"=>false, "state2"=>false, "state3"=>false, "tags"=>[{"name"=>"動物"}], "controller"=>"api/v1/phrases", "action"=>"create", "phrase"=>{"id"=>1, "japanese"=>"ねこ", "english"=>"cat"}}
      def create
        @phrase = current_api_v1_user.phrases.build(phrase_params)
        
        tag_names = params.require(:tags).map { |tag| tag.permit(:name)[:name] }

        # 重複を取り除く
        tag_names = tag_names.to_set.to_a

        if tag_names.empty?
          render json: { message: 'タグが登録されていません' }, status: :unprocessable_entity
          return
        end

        # 作成できるタグの数は20個まで
        if (@phrase.tags.pluck(:name) + tag_names).length > 20
          render json: { message: 'タグは20個までしか登録できません' }, status: :unprocessable_entity
          return
        end

        ActiveRecord::Base.transaction do
          if @phrase.save
            # 受け取ったタグの中で、既に登録されているものを取得
            existing_tags = Tag.where(name: tag_names)
            existing_tag_names = existing_tags.pluck(:name)

            # 新しく登録するべきタグを取得
            new_tags = tag_names - existing_tag_names
    
            if not new_tags.empty?
              # 新しく登録するべきタグを登録
              Tag.insert_all(new_tags.map { |tag| { name: tag, created_at: Time.current, updated_at: Time.current } })
            end

            # TagとPhraseを関連付けるために、all_tagsを再度取得
            all_tags = Tag.where(name: tag_names)

            # TagとPhraseを関連付け
            @phrase.tags << all_tags

            # checkテーブルに初期値を登録
            Check.create!(user: current_api_v1_user, phrase: @phrase, state1: false, state2: false, state3: false)
            
            render json: @phrase, status: :created
          else
            render json: { errors: @phrase.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end


      # PUT /api/v1/phrases/:id
      # 指定されたidのフレーズの情報を更新する関数
      # paramsの例
      # Parameters: {"id"=>"23", "japanese"=>"犬", "english"=>"dog", "state1"=>false, "state2"=>false, "state3"=>false, "tags"=>[{"id"=>18, "name"=>"動物", "created_at"=>"2025-01-12T12:19:13.697Z", "updated_at"=>"2025-01-12T12:19:13.697Z"}, {"name"=>"いぬ"}], "phrase"=>{"id"=>"23", "japanese"=>"犬", "english"=>"dog"}}
      def update
        @phrase = current_api_v1_user.phrases.includes(:tags).find_by(id: params[:id])
      
        if @phrase.nil?
          render json: { errors: ['フレーズが見つかりません'] }, status: :unprocessable_entity
          return
        end

        # 現在のフレーズに登録されているタグを取得
        current_tags = @phrase.tags.pluck(:name)

        # 更新後のタグのリストを取得
        new_tags = params.require(:tags).map { |tag| tag.permit(:name)[:name] }

        if new_tags.empty?
          render json: { message: 'タグが登録されていません' }, status: :unprocessable_entity
          return
        end

        # 削除するタグのリストを計算
        delete_tags = current_tags - new_tags

        # 追加するタグのリストを計算
        add_tags = new_tags - current_tags

        # 作成できるタグの数は20個まで
        if new_tags.length > 20
          render json: { message: 'タグは20個までしか登録できません' }, status: :unprocessable_entity
          return
        end
      
        ActiveRecord::Base.transaction do
          if @phrase.update(phrase_params)
            # チェック状態の更新
            @phrase.check.update!(check_params)

            # delete_tagsのタグを削除
            if delete_tags.present?
              delete_tags.each do |tag_name|
                tag = @phrase.tags.find { |t| t.name == tag_name }
                @phrase.tags.delete(tag) if tag.present?
              end
            end

            # add_tagsのタグを追加
            if add_tags.present?
              add_tags.each do |tag_name|
                tag = Tag.find_or_create_by(name: tag_name)
                @phrase.tags << tag unless @phrase.tags.include?(tag)  # 重複を防ぐ
              end
            end
      
            render json: @phrase, status: :ok
          else
            render json: { errors: @phrase.errors.full_messages }, status: :unprocessable_entity
          end
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      # DELETE /api/v1/phrases/:id
      # 指定されたidのフレーズを削除
      # paramsの例
      # Parameters: {"id"=>"22"}
      def destroy
        @phrase = current_api_v1_user.phrases.find_by(id: params[:id])
        
        if @phrase
          ActiveRecord::Base.transaction do
            @phrase.tags.each do |linked_tag|
              # 他のフレーズでそのタグが使われていない場合、タグを削除
              if linked_tag.phrases.count == 1
                linked_tag.destroy
              end
            end
      
            #フレーズとrelationを削除
            @phrase.destroy
      
            render json: { message: 'フレーズが削除されました' }, status: :ok
          end
        else
          render json: { message: 'フレーズが見つかりません' }, status: :not_found
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end
      

      private

      def correct_user
        @phrase = current_api_v1_user.phrases.find_by(id: params[:id])
        render json: { message: '許可されていません' }, status: :forbidden if @phrase.nil?
      end

      def phrase_params
        params.require(:phrase).permit(:user_id, :japanese, :english)
      end

      def check_params
        params.permit(:state1, :state2, :state3)
      end

    end
  end
end
