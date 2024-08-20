# Rest Boilerplate Backend Typescript Knitto 

Repository ini digunakan untuk base dasar untuk pembuatan aplikasi backend, dan akan selalu di update sesuai kebutuhan yang ada di knitto.

kunjungi branch **[example/simple-case](https://github.com/knittotextile/rest-boilerplate-ts/tree/example/simple-case)** untuk mencoba koneksi database Mysql dan queue message Rabbitmq, kemudian download **[Postman Collection](https://drive.google.com/file/d/1QAPqquKXpqfqqg0QWBJrmaP3a3C3Qm19/view?usp=drive_link)** berikut untuk melakukan percobaan.

## Struktur Project 

**`Keterangan`**
- Pengguna nama file atau folder ketika ada spasi menggunakan `camelCase`.
- Masukan kedalam folder bila terdapat pengujian atau file lain yang berinterkasi seperti pada contoh folder controller dan middleware di bawah.
----------

```
/ root directory
├─ database														# digunakan untuk migration database
├─ src																# source prorgam
│  ├─ app															# folder jenis aplikasi yang dibuat
│  │  ├─ background										# aplikasi yang bersifat background (timer, scheduler, emitter, etc)
│  │  ├─ http													# aplikasi http (rest-api)
│  │  │  ├─ [nama-path-http]
│  │  │  │  └─ namaController
│  │  │  │  ├─ [namaController].controller.ts
│  │  │  │  ├─ [namaController].request.ts
│  │  │  │  ├─ [namaController].routes.ts
│  │  │  │  └─ [namaController].spec.ts
│  │  │  ├─ index.ts									# file konfigurasi server http
│  │  │  └─ middlewares
│  │  │     └─ namaMiddleware.ts
│  │  ├─ messageBroker								# aplikasi penghubung ke message broker
│  │  │  ├─ index.ts									# konfigurasi aplikasi message broker
│  │  │  ├─ publishers								# publisher
│  │  │  └─ subscribers								# subscribers
│  │  └─ ws														# aplikasi web socket
│  ├─ index.ts												# starting point aplikasi
│  ├─ libs														# source code pendukung aplikasi
│  │  ├─ config												# configurasi dan constans
│  │  ├─ helpers											# function-function general seperti stringFormatter, dateFormatter etc
│  │  └─ types												# general types (semua file disini gunakan format .d.ts)
│  ├─ repositories										# kumpulan query ataupun logic interaksi ke db yang ada kemungkinan di sharing, process update, insert dan delete wajib di simpan di folder ini
│  └─ services												# kumpulan kode logic aplikasi yang berhubungan dengan flow bisnis dan ada kemungkinan di sharing
├─ storage														# tempat penyimpanan file-file yang dibutuhkan aplikasi
│  └─ static													# file yang tidak akan berubah secara dinamis
│     ├─ private											# file yang hanya bisa diakses oleh aplikasi
│     └─ public												# file yang bisa diakses tanpa melalui aplikasi
└─ tests															# test file

```

## Core Knitto Package
repository ini menggunakan library khusus [**`Knitto Core Backend`**](https://github.com/knittotextile/knitto-core-backend) secara private, gunakan panduan berikut untuk cara install library core [**`Working with the npm registry`**](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
