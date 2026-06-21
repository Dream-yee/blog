---
title: 樹莓派初見
subtitle: To remove French language pack: sudo rm -fr /*
published: 2026-06-21
updated: 
tags: geek, linux, tutorial
banner: images/raspberry_pi_hello/IMG_0128.HEIC
---

家裡閒置了一個 Raspberry Pi **5**，最近剛好有空了可以開開看。

## 灌OS

### Step 1. Get A microSD
Raspberry Pi OS 要灌到這個 microSD，樹莓派才有系統可以用。
而且我還要多買一個可以讓我電腦讀 microSD 的轉接頭。

### Step 2. Download Raspberry Pi Imager
[下載連結](https://www.raspberrypi.com/software/)
下載之後點開可以挑買的型號以及你要灌到哪個記憶體。
其他要幹嘛就看你。

### Step 3. 等他載
看一集 The Big Bang Theory 就好了。

### Step 4. Micro SD插進去你的樹莓派
插，你會看到一個 microSD 孔在你的板子上。

### Step 5. 跳舞
開香檳慶祝。

## 用 MacBook 連線
我之後想拿這台常駐跑一些東西，但接螢幕很麻煩欸我只有一個螢幕，所以我想直接從 Mac 的 Terminal 控制。

### ssh

在樹莓派的 Terminal 內 輸入 `hostname -I`
會跑出一坨字串，把前面的 192.168.X.XX 記起來。

在 Mac 的 Terminal 內 輸入 `ssh <username>@<ip address>`
`<username>` 是你在樹莓派裡的username, `<ip address>` 是剛剛要你記起來的那串。
輸入完 Password 你就進去了。

## 共用資料夾
我是照著[這部影片](https://www.youtube.com/watch?v=0LFROT5mXiA)做的。
**下面所有的指令都在樹莓派的 Terminal 裡面執行，你可以直接 ssh 連過去。**

### Step 1. 確保OS up to date
輸入 `sudo apt-get update -y`
![update](images/raspberry_pi_hello/update_os.png){width=400}

### Step 2. Install Samba
輸入 `sudo apt install samba samba-common-bin -y`
載好之後輸入 `sudo systemctl enable --now smbd`

### Step 3. 設定分享的資料夾
輸入 `cd /etc/samba/`
然後輸入 `sudo nano smb.conf`，會打開下面這個畫面：
![update](images/raspberry_pi_hello/smb_conf.png){width=400}
滑到最底下，輸入下面這些：
```
[share]
path = /home/<username>/Public
browsable = yes
writable = yes
force create mode = 0666
force directory mode = 0777
force user = <username>
```
`<username>` 記得換掉，上面的`share`可以改成你自己要的名字。
`path` 指的是你想共用的資料夾，後面當你用 mac 去連樹莓派的資料夾的時候他會以 `share` 的名字 (假如你沒改的話) 出現在裡面

最後按`ctrl + X`，會問你要不要修改，如果你不想成功的話可以輸入 `N`。

### Step 4. 設定密碼
輸入 `sudo smbpasswd -a <username>` ，他會要你設定一組 smb 密碼。

### Step 5. Restart Samba Server
輸入 `sudo systemctl restart smbd`
他什麼都不會顯示，可以接著輸入 `sudo systemctl status smbd`, 看看是不是 active.
![status](images/raspberry_pi_hello/status.png){width=400}

### Step 6. 應該要成功了
進 Mac 的 Finder 側欄找到 Network 點進去，應該要看到你的機器的名字，我的叫dreamAvocado
![dreamAvocado](images/raspberry_pi_hello/network.png){width=400}
進去之後右上角會有一個 connect 輸入你的username跟password to login.
我的共用資料夾叫 avocadoShare 他會跟 /home/dreamyee/Public 連動，像下面這樣。
![share](images/raspberry_pi_hello/share.png){width=400}


## Reference
* [Remote access | Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/computers/remote-access.html)
* [2025 Guide to Raspberry Pi File & Folder Sharing! | YouTube](https://www.youtube.com/watch?v=0LFROT5mXiA)