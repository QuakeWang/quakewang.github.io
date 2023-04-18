---
title: "MySQL——Access denied for user 'root'@'localhost' (using password: YES) 问题解决"
date: 2023-04-18
---

### 遇见问题？？

这两天在折腾一个数仓测试环境的迁移，MySQL 自然是必不可少缺少的咯，因为是测试环境，配置都是按最方便的来做，配置过程可参考：[MySQL 安装](https://github.com/QuakeWang/BigData-HowToConfigure/blob/main/005_MySQL/mysql.md)

前一天使用都是正常的，结果第二天不知什么原因，在使用 Maxwell 进行增量同步业务数据到 HDFS 过程中，爆出以下错误：`java.sql.SQLException: Access denied for user 'root'@'aliyun001' (using password: YES)` 这是一个常见的错误，遇到好几次，所以记录以下。

### 解决？？？

遇到该问题，立刻就尝试使用`mysql -u root -p`来登录数据库看看，结果仍然报错，同上。这时意识到数据库是进不去了。。。

于是乎，可以先设置跳过密码：

```shell
vim /etc/my.cnf
skip-grant-tables     #在[mysqld]下面添加这一行，忽略权限表
```

重启 MySQL：`sudo systemctl restart mysqld.service`

进入之后选择 `use mysql`，然后 `select user, host from user;` 出现的结果令人惊讶！！！没有 root 用户了？？？没有就自己造一个！！！

养成好习惯先刷新一下：`flush privileges;`

创建`create user 'root'@'localhost' identified by '123456';`，然后报错：`ERROR 1396 (HY000): Operation CREATE USER failed for 'root'@'localhost'`，估计应该是没删干净？？再删一下：`drop user root@'localhost';`，刷新一下；这个时候再创建就 ok 了~~

有了 root 用户之后，再给权限：`mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION; #赋予所有库所有表操作权限`；刷新一下~~

再回到 `/etc/my.cnf` 删除 `skip-grant-tables`。重启数据库，这个时候就可以正常使用了~~

如果为了方便还可以再设置一下 host 为 %：`update user set host="%" where user="root";`