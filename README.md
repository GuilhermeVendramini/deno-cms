# Deno CMS AND API

### Requirements:

* Denon
* Mongodb

### Run:

```shell
denon install
```

```shell
denon start
```

### Default user login:

**email**: admin@admin.com

**password**: 12345678

## Features

**CMS**
* User roles permissions
* User register/login
* Basic Page content type (CRUD)

**API**
* User register/login
	* POST USER REGISTER
	* POST USER LOGIN
	* GET ONE
	* GET ALL
* Basic Page content type 
	* GET ONE
	* GET ALL

## API

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

### Basic page

**Get all Basic page**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/content/basic-page
```

**Get one Basic page**
```shell
curl -H "Authorization: Bearer <LOGGED-USER-TOKEN>" http://localhost:8000/api/content/basic-page/<CONTENT-ID>
```

## TODO

- [ ] Article content type
- [ ] Blocks (basic block)
- [ ] Menus ( header and footer)
- [ ] Taxonomies (tags)
- [ ] Media types (image and video)
- [ ] Tests