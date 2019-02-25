## Pirple NodeJS course: Homework assignment #2

### Requirements
You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 
4. A logged-in user should be able to fill a shopping cart with menu items
5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards
6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

Important Note: If you use external libraries (NPM) to integrate with Stripe or Mailgun, you will not pass this assignment. You must write your API calls from scratch. Look up the "Curl" documentation for both APIs so you can figure out how to craft your API calls. 

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 

### Implementation planning

Create a storage library (based on a files) providing the following interface: `create`, `read`, `update`, `delete`.  

Provide a `GET` handler to receive all available menu items (statically hardcoded).

#### Storage schema
   Each data type will be stored in a separate directory.

   - Users
     - CRUD
     - fields: name, **email address**, password, street address, cart (points to an order id), orders list
     - cart contains an order with the currently selected menu items
     - orders list contains all placed orders
     - when an order from the cart is placed it should be moved into the orders list
   - Tokens
     - CRUD
     - fields: **id**, email address, expires date
   - Orders
     - CRUD
     - fields: **id**, email address, products, state

### API endpoints
   - `/users`
     - `post` - name, email, password, address
     - `get` - email
     - `put` - email, name, password, address
     - `delete` - email
   - `/login`
     - `post` - email, password
   - `/logout`
     - `delete`
   - `/cart`
     - `post` - products
     - `get` - id
     - `put` - id, state
     - `delete` - id
   - `/checkout`
     - `post` - order id

API calls fingerprint:
```json
{
   "message": "",
   "data": null || <Object>
}
```

### How to test
#### TODO: Instrictuions that experimental features are used.

Start the HTTP server with using either of the following commands:
```sh
node index
# OR
PORT=5000 node index
```

If you don't set a port, the default one will be `3000`.

### Further optimizations
 - [ ] Export the storage errors messages in a constant file
 - [ ] Create `./data/` subfolders on server initialization (if they doesn't already exists)
