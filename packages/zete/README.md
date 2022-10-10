# Zete

🚀 zete is a desktop app framework based on electron and svelte

```bash
$ yarn create zete my-app
$ cd my-app
$ yarn dev
```

## File Based Routing

```
./users/[user].svelte => users/awesome_user_name
./[slug]/index.svelte => /hello/ (/hello x)
```

```html
<!-- users/[user].svelte -->
<script>
  export let user;
</script>

@{user}'s page!
```

## Customizing

```js
// core/desktop.js

module.exports = function (browserWindow) {
  /* electron api */
};
```

## License

mit
