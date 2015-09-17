# NineJS Authentication module (ninejs/auth)

Provides a configurable authentication mechanism for your applications.

### ninejs/auth works on both client side and server side (Node.js)

## Server side (Node.js)

`ninejs/auth` registers the `ninejs-auth-module` AMD prefix into your client side. In this prefix resides the necessary JS files to serve the client side module.

### Parameters

* loginUrl: String. This is the endpoint where client side will post it's authentication request.

| Method | Action             | Returns |
|--------|--------------------|---------|
| GET    | Queries whether or not I (as a user) am logged into the system. | `{ result: String of ('success', 'failed'), id: 'username', loggedInSince: new Date(), permissions: [String] }` |
| POST   | Posts a login request to the server side. `{ user: 'username', password: '', parameters: {} }` | `{ result: String of ('success', 'failed'), message: String }` |

### The `ninejs/auth` server-side (Node.js) unit

`ninejs/auth` provides the following:

| Name      | Type                                                                                        |  Description  |
|-----------|---------------------------------------------------------------------------------------------|---------------|
| login     | function username, password, domain, callback (loginData) [optional] -> promise (loginData) | Login    |

## Server side (others)

As long as you implement the endpoints as described above you will be able to use ninejs/auth with other platforms.

## Client side

Include the `client-side` folder as an AMD prefix (e.g. `ninejs-auth-module`) and load the module in NineJS's config as follows:


	{
		modules: {
			'ninejs-auth-module/module': {
				'ninejs/auth': {
					'loginUrl': '<yourLoginUrlEndpoint>',
					'logoutUrl: '<yourLogoutUrlEndpoint>',
					'skin': {
						//Use this to override the login screen's skin with a skin located in this AMD path, defaults to empty string
						'login': ''
					}
				}
			}
		}
	}


### The `ninejs/auth` client-side (Node.js) unit

`ninejs/auth` provides the following: