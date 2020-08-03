# OAK Deno CMS and Rest API

#### Requirements

* Deno 
     * Tested with deno 1.2.2, v8 8.5.216 and typescript 3.9.2.
* Mongodb

#### Optional

* Denon

### Install

```shell
denon install
```
or
```shell
deno run --allow-env --allow-write --allow-read --allow-net --allow-plugin --allow-run --unstable --importmap=package.json install.ts
```
### Run
```shell
denon start
```
or
```shell
deno run --allow-env --allow-write --allow-read --allow-net --allow-plugin --allow-run --unstable --importmap=package.json main.ts
```

### Default user login:

**email**: admin@admin.com

**password**: 12345678

## Features
**CMS**
* **User**
    * User (CRUD)    
    * Roles permissions
    * Register
    * Login
    * Recovery password
* **Content type**
    * Basic Page (CRUD)
    * Article (CRUD)
    * Landing Page (CRUD)
* **Taxonomy type**
    * Tags (CRUD)
    * Categories (CRUD)
* **Block type**
    * Basic block (CRUD)
* **Media type**
    * Image (CRUD)
    * Cropped Image (CRUD)
    * Video (CRUD)
* **Menu type**
    * Main menu (CRUD items)
    * Footer (CRUD items)

**API**
* **User**
	* POST User register
	* POST User Login
	* GET One user
	* GET All users
* **Entities**
	* GET One
	* GET All

## Rest API examples

### Users
**Register**
```shell
curl -d '{"name":"Name", "password": 12345678, "email":"test@test.com"}' -H "Content-Type: application/json" -X POST http://localhost:8000/api/register
```

**Login**
```shell
curl -d '{"password": 12345678, "email":"test@test.com"}' -H "Content-Type: application/json" -X POST http://localhost:8000/api/login
```

**Get all user**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/users
```

**Get one user**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/users/<USER-ID>
```

### Entities

Bundle and types list:

Bundle | Types
--- | ---
content | basic_page \| article \| landing_page
media | image \| video \| cropped_image
taxonomy | tags \| categories
block | basic_block
menu_item | main_menu \| footer


**Get all**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/<BUNDLE>/<TYPE>
```

**Get one**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/<BUNDLE>/<TYPE>/<CONTENT-ID>
```

## TODO

 - [ ] Tests