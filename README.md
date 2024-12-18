# 英単語学習アプリ

## 機能
### フレーズ登録機能
日本語と英語のフレーズの組を記録できます。フレーズ毎にチェック状態やタグをつけることが出来ます。


### 検索機能
外部サイトから、日本語のフレーズに対応する英語のフレーズを検索できます。気に入ったフレーズがあればすぐに登録できます。


### テスト機能
登録した単語から問題を出すことが出来ます。

## 動作手順
```
.envを用意
docker compose build
docker compose run --rm api rails db:create db:migrate db:seed
docker compose up
```