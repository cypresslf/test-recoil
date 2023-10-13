# Recoil and Redux comparison

I compare redux and recoil for selective rendering of components within a list. Redux needs to re-compare all elements in the list in order to determine which ones to rerender, whereas Recoil does not.

## To run

[Install bun][1]

### Development mode

```sh
bun dev
```

### Production mode

```sh
bun run build
bun preview
```

[1]: https://bun.sh/docs/installation

## Profiling

- redux: https://share.firefox.dev/3S2x4cx
  ![image](https://github.com/cypresslf/test-recoil/assets/133676745/9a111fce-0f58-4e38-9024-7b7c7c4c9f1b)

- recoil: https://share.firefox.dev/46snjZs
  ![image](https://github.com/cypresslf/test-recoil/assets/133676745/7fbd4ec8-057d-4e87-a080-e66f4663beaa)

Recoil takes significantly less CPU time for javascript (notice the gaps in processing between frames). Redux has more jank.
