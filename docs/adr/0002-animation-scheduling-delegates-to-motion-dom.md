# Animation scheduling delegates to motion-dom; deliberate divergences are named here

The declarative animation scheduler (`animateChanges` / `setActive` / variant diffing) is **not** implemented in motion-vue. `AnimationFeature` wires motion-dom's public `createAnimationState` directly onto the visual element, and post-mount variant inheritance uses motion-dom's `getVariantContext` / `variantProps`. The previous local port (503 lines) drifted from upstream — it silently dropped the exit re-processing guard, `wasReset` semantics, and `variantDidChange` keyframes detection — and the drift produced real bugs (exit animations restarting when `custom` changed mid-exit).

Guardian tests live in `packages/motion/src/state/__tests__/animation-state.test.ts` and exercise the *wired* path, so a future motion-dom upgrade that changes these semantics fails CI. `tests/variant-interrupt.spec.ts` locks the mid-flight interruption behavior end-to-end.

## The three deliberate divergences

Everything internal speaks upstream (motion-dom) naming and semantics, except:

1. **`whilePress` → `whileTap` boundary translation.** The public API prop is `whilePress` (Vue-idiomatic, see ADR 0001); motion-dom internals speak `whileTap`. The translation happens exactly once, in `toUpstreamProps` in `state/motion-state.ts`, at the MotionState → visual element props boundary. Gesture features call `setActive('whileTap', …)`.
2. **Pre-mount variant inheritance Proxy.** framer-motion creates the visual element during React's render phase, so initial styles resolve against the visual element tree. Vue creates the visual element at mount, so first render / SSR needs inherited variant labels before any visual element exists. `MotionState.context` (a Proxy over the MotionState parent chain) serves only this pre-mount window (`resolveInitialValues`); post-mount scheduling uses upstream `getVariantContext` over `visualElement.parent`. The two never overlap.
3. **`whileInView` inheritance follows upstream.** Local `variantProps` used to omit `whileInView`, so variant children did not inherit a parent's in-view variant state. Adopting upstream `variantProps` restores the inheritance — this is a behavior **change** relative to older motion-vue versions, intentional, aligned with framer-motion.

## Consequences

- Do not re-introduce local copies of motion-dom scheduling utilities (`createAnimationState`, `getVariantContext`, `variantProps`, `calcChildStagger`, `checkVariantsDidChange`, …). If upstream lacks something we need, extend at the call site and record it here.
- motion-dom/framer-motion stay on semver ranges (not pinned); the guardian tests are the upgrade sentinel. When they fail after an upgrade, the upstream diff — not the test — is the first thing to read.
- Exit activation has exactly one internal entry point (`MotionState.activateExit`); `setActive` rejects `'exit'` by invariant. `getSnapshot`/`didUpdate` are Feature protocol methods, never patched onto MotionState.
