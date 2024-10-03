<h1 align="center">
  <img src="https://raw.githubusercontent.com/joaolfern/react-freeze-snapshot/main/.github/images/react-freeze-snapshot.png" width="170px"/><br/>
  React Freeze Snapshot (for React-DOM only)
</h1>

<p align="center" style="font-size: 130%">
  Prevent React component subtrees from rendering while displaying a static snapshot.
</p>

# What is this? 🤔

**React Freeze Snapshot** is a fork of the **React Freeze** library built exclusively for `react-dom`. It allows you to freeze the renders of parts of the React component tree using the `Suspense` mechanism introduced in React 17, but with a twist: instead of replacing frozen components with a placeholder, that this fork displays a static (only visual) snapshot of the inner HTML from the moment the freeze happened. The frozen components **are not unmounted** during the freeze, so their React state and corresponding DOM elements are retained, keeping things like scroll position, input state, or loaded images unchanged.

This is useful for avoiding unnecessary re-renders of elements unavailable for user interaction while still keeping the static appearance of the elements intact. For example: for freezing the background of a Modal Route ([react-router-dom v6 example](https://github.com/remix-run/react-router/discussions/9864#discussioncomment-7414645))

> **Note:** If you're looking for a version that supports **React Native**, please refer to the original [React Freeze](https://github.com/software-mansion-labs/react-freeze) package.

# Quick Start ⚡

> You need to be using React 17 or higher.

Install `react-freeze-snapshot` from npm:

```bash
yarn add react-freeze-snapshot
```

Import `Freeze` component in your app:

```js
import { Freeze } from "react-freeze-snapshot";
```

Wrap some components you want to freeze and pass `freeze` option to control whether renders in that components should be suspended:

```js
function SomeComponent({ shouldSuspendRendering }) {
  return (
    <Freeze freeze={shouldSuspendRendering}>
      <MyOtherComponent />
    </Freeze>
  );
}
```

# Component docs 📚

The `react-freeze-snapshot` library exports a single component called `<Freeze>`.
It can be used as a boundary for components for which we want to suspend rendering.
This takes the following options:

### `freeze: boolean`

This options can be used to control whether components rendered under `Freeze` should or should not re-render.
If set to `true`, all renders for components from `Freeze` subtree will be suspended until the prop changes to `false`.
Additionally, during the time components are "frozen", `Freeze` component instead of rendering children will render component provided as `placeholder` parameter removing frozen components from screen while retaining their native view instances and state.

### `placeholder?: React.ReactNode`

This parameter can be used to customize what `Freeze` component should render when it is in the frozen state (`freeze={true}`).
This is an optional parameter and by default it renders a snapshot of `Freeze`'s content that won't react to changes in your application state.

### `wrapperProps?: React.HTMLAttributes<HTMLDivElement>`

This parameter allows you to pass additional props to the wrapper `<div>` element that surrounds the `Freeze` component's children. This can be useful for adding custom styles, classes, or other attributes to the wrapper.

### `placeholderProps: React.HTMLAttributes<HTMLDivElement>`

This parameter allows you to pass additional props to the placeholder `<div>` element that is rendered when the component is in the frozen state (`freeze={true}`). This can be useful for customizing the appearance or behavior of the placeholder.

#### Note on div Elements

The `Freeze` component adds `div` elements around its children in order to accessing copying and displaying `innerHtml`. Specifically:

- An outer `div` element that wraps the entire content. You can customize this `div` using the `wrapperProps` prop.
- A `div` element for the placeholder content when the component is in the frozen state. You can customize this `div` using the `placeholderProps` prop.

# Known issues 😭

> Have a problems with react-freeze-snapshot? Start a [New issue](//github.com/joaolfern/react-freeze-snapshot/issues).

# FAQ ❓

## When component subtree is frozen what happens to state changes that are executed on that subtree

All state changes are executed as usual, they just won't trigger a render of the updated component until the component comes back from the frozen state.

## What happens to the non-react state of the component after defrost? Like for example scroll position?

Since all the DOM elements are retained when the component is frozen, their state (such as scroll position, input values, etc.) is restored when they come back from the frozen state. The same DOM nodes are used.

## What happens when there is an update in a Redux store that the frozen component is subscribed to?

Redux and other state-management solutions rely on manually triggering re-renders for components that they want to update when the store state changes.
When component is frozen it won't render even when redux requests it, however methods such as `mapStateToProps` or selectors provided to `useSelector` will still run on store updates.
After the component comes back from frozen state, it will render and pick up the most up-to-date data from the store.

## Can freezing some of my app components break my app? And how?

There are few ways that we are aware of when `<Freeze>` can alter the app behavior:

1. When component render method has side-effects that relay on running for all prop/state updates. Typically, performing side-effects in render is undesirable when writing react code but can happen in your codebase nonetheless. Note that when subtree is frozen your component may not be rendered for all the state updates and render method won't execute for some of the changes that happen during that phase. However, when the component gets back from the frozen state it will render with the most up-to-date version of the state, and if that suffice for the side-effect logic to be correct you should be ok.

<br/>
<hr/>

Forked from [Software Mansion's React Freeze](https://github.com/software-mansion-labs/react-freeze) and adapted. Licensed under [The MIT License](LICENSE).
