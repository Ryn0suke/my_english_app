FROM node:20 as build

# 作業ディレクトリを /usr/src/app/frontend に変更
WORKDIR /usr/src/app/frontend

# package.jsonとpackage-lock.jsonをコピーして依存関係をインストール
COPY ./frontend/package*.json ./

# 依存関係をインストール
RUN npm install

COPY ./frontend .

# ビルド
RUN npm run build

FROM nginx:latest

# 非rootユーザー作成
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# NGINXが必要とするディレクトリの権限を変更
RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp/nginx && \
    chown -R appuser:appgroup /var/cache/nginx /var/log/nginx /tmp/nginx /usr/share/nginx/html

# NGINXのpidファイルのパスを修正
RUN sed -i 's|/var/run/nginx.pid|/tmp/nginx.pid|g' /etc/nginx/nginx.conf

# NGINXのデフォルト設定ファイルを削除
RUN rm /etc/nginx/conf.d/default.conf

# ビルドしたファイルをnginxの公開ディレクトリにコピー
COPY --from=build /usr/src/app/frontend/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d

# 非rootユーザーで実行
USER appuser

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
