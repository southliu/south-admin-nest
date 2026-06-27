<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## 初始化

```bash
$ pnpm install
```

## 运行项目

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## 测试

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## 初始化数据库

运行项目之后自动生成数据库表，执行命令`pnpm db:init`或者数据库导入`init.sql`文件。

## 前端项目

react: [react-admin](https://github.com/southliu/south-admin-react)

## 前后端联调

启动dajgo项目之后需要将react-admin项目中的`.env.development`改成：

```
VITE_ENV = "development"

# 端口号
VITE_SERVER_PORT = 7000

# 跨域
# VITE_PROXY = [["/api", "https://mock.mengxuegu.com/mock/63f830b1c5a76a117cab185e/v1"], ["/test", "https://www.baidu.com"]]

VITE_PROXY = [["/api", "http://127.0.0.1:8000/"]]
```
