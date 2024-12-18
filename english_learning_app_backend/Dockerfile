FROM ruby:3.1.3-alpine

ARG RUBYGEMS_VERSION=3.3.20

RUN apk update && apk add --no-cache \
    postgresql-client postgresql-dev nano build-base bash nodejs yarn libc6-compat && \
    rm -rf /var/cache/apk/*

# 非rootユーザーとグループを作成
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# 環境変数の設定
ENV RAILS_ENV=production \
    NODE_ENV=production \
    BUNDLE_WITHOUT="development test"

# 作業ディレクトリを作成し、所有権を非rootユーザーに変更
RUN mkdir -p /app && chown -R appuser:appgroup /app
WORKDIR /app

COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock
RUN gem install bundler && \
    gem update --system ${RUBYGEMS_VERSION} && \
    bundle install --jobs=4 --retry=3

# アプリケーションのソースをコピーし、所有権を変更
COPY . /app
RUN chown -R appuser:appgroup /app

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh && \
    chown appuser:appgroup /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# 非rootユーザーで実行
USER appuser

EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]
