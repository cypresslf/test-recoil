# Recoil and Redux comparison

I compare redux and recoil for selective rendering of components within a list. Redux needs to re-compare all elements in the list in order to determine which ones to rerender, whereas Recoil does not.

## To run

[Install bun][1]

```sh
bun dev
```

[1]: https://bun.sh/docs/installation

## Profiling in Firefox

- redux: https://share.firefox.dev/3S2x4cx
![image](https://github.com/cypresslf/test-recoil/assets/133676745/9a111fce-0f58-4e38-9024-7b7c7c4c9f1b)

- recoil: https://share.firefox.dev/46snjZs
![image](https://github.com/cypresslf/test-recoil/assets/133676745/7fbd4ec8-057d-4e87-a080-e66f4663beaa)

Recoil takes significantly less CPU time for javascript (notice the gaps in processing between frames). Redux has more jank.


## Profiling in Chromium

Chromium lets me throttle the CPU, so I throttled 4x for the following.

- redux: https://github.com/cypresslf/test-recoil/blob/main/redux%204x%20cpu%20throttle.json
![image](https://github.com/cypresslf/test-recoil/assets/133676745/954d1559-2928-474f-b9ae-3f01957ee6fe)
  
- recoil: https://github.com/cypresslf/test-recoil/blob/main/recoil%204x%20cpu%20throttle.json
![image](https://github.com/cypresslf/test-recoil/assets/133676745/32cbb1b0-c65f-4ecf-9cbf-f05abf8ca2c9)

|           | Frame Length | Event Processing |
|-----------|--------------|------------|
| Recoil    | ~86ms        | ~10ms      |
| Redux     | ~117ms       | ~34ms      |

It looks like redux is ~3x slower for the given profile.
