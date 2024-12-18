# 英単語学習アプリ

## 機能
### フレーズ登録機能
日本語と英語のフレーズの組を記録できます。フレーズ毎にチェック状態やタグをつけることが出来ます。
![登録機能](https://github.com/user-attachments/assets/e7c785e9-f51f-4c40-ae74-191f80418c3a)


### 検索機能
外部サイトから、日本語のフレーズに対応する英語のフレーズを検索できます。気に入ったフレーズがあればすぐに登録できます。
![検索機能](https://github.com/user-attachments/assets/4972b7b4-5277-4638-8496-f7f30667c3dc)


### テスト機能
登録した単語から問題を出すことが出来ます。
![テスト機能](https://github.com/user-attachments/assets/6856c912-b4e1-4c92-8a19-815d713001b5)


## 動作手順
```
.envを用意
docker compose build
docker compose run --rm api rails db:create db:migrate db:seed
docker compose up
```
