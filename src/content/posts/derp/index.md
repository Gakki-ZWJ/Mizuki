---
title: 自建Derp中转服务器
published: 2025-12-06
description: 'Tailscale的中转服务器'
image: "./cover.png"
tags: [Derp]
category: 'Tailscale'
draft: false 
---

:::caution[注意]
注意国内服务器使用域名连接需要备案，要不然搭建好了也无法使用中转
:::
:::warning[警告]
创建Derper服务的代码中，开启了防白嫖模式，所以必须将Derp服务器也加到Tailscale中后才能让同账户的其它机器使用自建的Derp中转服务器
:::
:::important[重要]
不建议使用阿里云的服务器，阿里云DNS与Tailscale使用的`100.`网段有冲突，需要添加iptables规则
:::
:::tip[提示]
如果使用NAT机搭建Derp中转服务器，需要注意在创建derper服务时，里面的端口要填NAT本地端口，在`Access Contorls`中要填写映射出去的端口，这一点非常重要
:::

## 搭建流程
:::note[演示]
**这里以无备案域名为演示**
:::

### 环境准备
```bash showLineNumbers=false
# 查看架构
uname -m
# 更新一下软件
apt update && apt upgrade
# 安装所需的软件
apt install -y wget git openssl curl
```

### 安装 Go 环境
根据[官方安装手册](https://tailscale.com/kb/1118/custom-derp-servers#step-1-starting-your-own-derp-server)，需要先安装 `Go` \
[**Go官网**](https://go.dev/dl/) \
安装`Go`时，国内机无法直连，最简单的方式本地下载好上传到服务器
```bash showLineNumbers=false {"# 获取go最新版本(1.25.5根据实际版本填写)":1-2} {"# 先删除现有的Go安装目录，然后将名为go1.25.5.linux-amd64.tar.gz的压缩包解压到 /usr/local":3-4} {"# 检验go是否安装成功，输出版本号则成功":5-7} {"# 将Go加入系统变量":8-10} {"# 更改go使用国内代理源":11-13} 
#
wget https://go.dev/dl/go1.25.5.linux-amd64.tar.gz

rm -rf /usr/local/go && tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz

export PATH=$PATH:/usr/local/go/bin
go version

echo "export PATH=$PATH:/usr/local/go/bin" >> /etc/profile
source /etc/profile

go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

### 拉取编译Derper
```bash showLineNumbers=false
# 拉取编译derper中转服务器
go install tailscale.com/cmd/derper@main
```

### 处理证书文件
安装好之后，我们要解决一下域名的校验问题 \
看一下这个路径下的证书文件`@v1.90.5xxx`为当前Derp版本号
`"/root/go/pkg/mod/tailscale.com@v1.90.5xxx/cmd/derper/cert.go"`
:::note[把框中的三行代码注释掉]
可以简单看一下，这是验证域名的用途，因为我们是没有备案域名，纯IP，所以这个地方注释掉，然后保存，不要去校验
:::
```go title="cert.go" {2-4} 
func (m *manualCertManager) getCertificate(hi *tls.ClientHelloInfo) (*tls.Certificate, error) {
	//if hi.ServerName != m.hostname && !m.noHostname {
	//	return nil, fmt.Errorf("cert mismatch with hostname: %q", hi.ServerName)
	//}
```

### 上传域名证书
***生成证书的方式有很多,这里不做介绍***
```bash showLineNumbers=false
# 创建/usr/local/cert文件夹
# 创建其它文件夹也可以，对应后面的文件夹也需要改动
mkdir /usr/local/Cert
```
将ssl证书上传到`/usr/local/Cert`，只需要上传`.key`和`.crt`文件

### 重新编译
用`Go`编译一下，并输出到指定目录`/etc/derp`
```bash showLineNumbers=false
cd /root/go/pkg/mod/tailscale.com@v1.90.5xxx/cmd/derper
go build -o /etc/derp/derper
```

### 创建derper服务
```bash 
cat > /etc/systemd/system/derp.service <<EOF
[Unit]
Description=Tailscale DERP Server
After=network.target
Wants=network.target

[Service]
User=root
ExecStart=/etc/derp/derper -certmode=manual -certdir=/usr/local/Cert -hostname=域名 -a=:自定义端口 -http-port=-1 -stun-port=自定义端口 --verify-clients
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
```
把云服务的`tcp`的`自定义端口`（HTTPS 需要）和`udp`的`3478`（STUN需要，默认`3478`，如果是NAT主机需要`自定义端口`）的端口打开 \
`--verify-clients`作用是[**添加客户端验证**](#防止derp被白嫖添加客户端验证)防止derp被白嫖

### 启动derper
```bash showLineNumbers=false
# 自启动derper服务
systemctl enable derp
# 启用derper服务
systemctl start derp
# 查看derper状态(是否启动成功)
systemctl status derp
```
检查中转服务器是否搭建成功
```cmd title="Browser" showLineNumbers=false {2}
# 浏览器输入下面链接(注意是https协议)，应该可以看到中转服务器在运行
https://域名:端口
```

## Tailscale后台配置
### Access Contorls
```json
# 去官方管理界面Access Contorls中写入如下命令
	// *************************主要是以下部分****************************
	"derpMap": {
		// OmitDefaultRegions 用来忽略官方的中继节点，一般自建后就看不上官方小水管了
		"OmitDefaultRegions": true,

		"Regions": {
			// 900-999为预留区域
			"999": {
				// RegionID 和上面的相等
				"RegionID": 999,
				// RegionCode 可以填写云厂商
				"RegionCode": "阿里云",
				// RegionCode 可以填写地区
				"RegionName": "杭州",
				"Nodes": [
					{
						// Name 保持 1不动
						"Name": "1",
						// 这个也和 RegionID 一样
						"RegionID": 999,
						// 域名
						"HostName": "这里填写Derp主机IP",
						// 端口
						"DERPPort": 这里填写Derp主机自定义端口,
						// STUN端口
						"STUNPort": 这里填写STUN自定义端口,
					},
				],
			},
		},
	},
	// *************************主要是以上部分***************************
```

## 防止Derp被白嫖（添加客户端验证）
:::tip
`--verify-clients`已提前在`derp.service`添加
:::
```bash showLineNumbers=false
# 服务器安装 tailscale
curl -fsSL https://tailscale.com/install.sh | sh
# 然后
tailscale up
# 将云服务器加入tailscale网络中
```

## Tailscale常用命令
```bash showLineNumbers=false
# 查看是否已经连接中转服务器
tailscale netcheck
# 查看中转服务器是不是正常状态，没报错是正常的，出错找之前的步骤
tailscale status
# tailscale ping 工具，ping通则正常
tailscale ping 分配的内网名称或IP
# tailscale客户端更新
tailscale update
# 上线
tailscale up
# 下线
tailscale down
```

## 涉及到的端口
```bash showLineNumbers=false
# HTTPS(在derp.service中配置)
TCP	自定义端口
# STUN(在Access Contorls中配置)
UDP	自定义端口
# Tailscale(在/etc/default/tailscaled中配置)
UDP	41641
#已备案域名(无法更改)
TCP 80 443
```
