# node基础镜像
FROM bh-harbor.suixingpay.com/zhaikun/node:15.1.0

# 将项目整体拷贝到app目录下
ADD . /home/app

# 指定工作目录，以后命令都基于这个目录
WORKDIR /home/app

# 容器启动时命令 启动项目 项目会以7001端口启动 ENV 要替换成真实的环境
CMD npm run start-ENV

# 对外暴露项目端口，这里只是定义，启动时，通过 -p 3000:7001指定
EXPOSE 7001

