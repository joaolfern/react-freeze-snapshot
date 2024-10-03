import React, { Dispatch, useEffect, useState, useReducer } from "react";
import {
  create,
  act,
  ReactTestRenderer,
  ReactTestRendererJSON,
} from "react-test-renderer";

import { Freeze } from ".";

test("Renders stuff not frozen", () => {
  function Content() {
    return <div />;
  }
  function Compoent() {
    return (
      <Freeze freeze={false}>
        <Content />
      </Freeze>
    );
  }
  const testRenderer = create(<Compoent />);
  const testInstance = testRenderer.root;
  expect(testInstance.findByType(Content)).toBeTruthy();
});

test("Does not render stuff when frozen", () => {
  function Content() {
    return <div />;
  }
  function Component() {
    return (
      <Freeze freeze>
        <Content />
      </Freeze>
    );
  }
  const testRenderer = create(<Component />);
  const testInstance = testRenderer.root;
  expect(testInstance.findAllByType(Content)).toHaveLength(0);
});

test("Stuff is render static content after freeze", () => {
  function Content() {
    const [count, increment] = useReducer((prev) => prev + 1, 0);
    return (
      <div>
        <p>We're at: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  }
  function Component({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Content />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;

  act(() => {
    testRenderer = create(<Component freeze={false} />);
  });

  const testInstance = testRenderer?.root;
  const button = testInstance?.findByType("button");

  act(() => {
    if (button) {
      button.props.onClick();
    }
  });

  const paragraph = testInstance?.findByType("p").props.children.join("");
  expect(paragraph).toBe("We're at: 1");

  act(() => testRenderer?.update(<Component freeze />));
  act(() => {
    if (button) {
      button.props.onClick();
    }
  });

  const frozenParagraph = testInstance?.findByType("p").props.children;
  expect(frozenParagraph.join("")).toBe("We're at: 1");
});

test("Updates work when not frozen", () => {
  function Content() {
    const [count, increment] = useReducer((prev) => prev + 1, 0);
    return (
      <div>
        <p>We're at: {count}</p>
        <button onClick={increment}>Increment</button>
      </div>
    );
  }
  function Component({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Content />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;

  act(() => {
    testRenderer = create(<Component freeze={false} />);
  });

  const testInstance = testRenderer?.root;
  const button = testInstance?.findByType("button");

  act(() => {
    if (button) {
      button.props.onClick();
    }
  });

  const paragraph = testInstance?.findByType("p").props.children.join("");
  expect(paragraph).toBe("We're at: 1");

  act(() => {
    if (button) {
      button.props.onClick();
    }
  });

  const frozenParagraph = testInstance?.findByType("p").props.children;
  expect(frozenParagraph.join("")).toBe("We're at: 2");
});

test("Updates does not propagate when frozen", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  act(() => testRenderer?.update(<Container freeze />));
  act(() => subscription(1));
  expect(testInstance?.findByType(Inner).props.value).toEqual(0);
  expect(renderCount).toBe(1);
});

test("State persists after defrost", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });

  const testInstance = testRenderer?.root;

  expect(testInstance?.findByType(Inner).props.value).toEqual(0);

  act(() => subscription(1));
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);

  act(() => testRenderer?.update(<Container freeze />));
  act(() => testRenderer?.update(<Container freeze={false} />));

  const defrostedInstance = testRenderer?.toJSON();

  expect((defrostedInstance as ReactTestRendererJSON).type).toBe("div");
  expect(testInstance?.findByType(Inner).props.value).toEqual(1);
});

test("Update propagate after defrrost", () => {
  let subscription: Dispatch<number>;
  // @ts-ignore unused prop
  function Inner({ value }: { value: number }) {
    return <div />;
  }
  let renderCount = 0;
  function Subscriber() {
    const [value, setValue] = useState(0);
    useEffect(() => {
      subscription = setValue;
    }, []);
    renderCount = renderCount + 1;
    return <Inner value={value} />;
  }
  function Container({ freeze }: { freeze: boolean }) {
    return (
      <Freeze freeze={freeze}>
        <Subscriber />
      </Freeze>
    );
  }
  let testRenderer: ReactTestRenderer | undefined;
  act(() => {
    testRenderer = create(<Container freeze={false} />);
  });
  const testInstance = testRenderer?.root;
  act(() => testRenderer?.update(<Container freeze />));
  act(() => subscription(1));
  act(() => subscription(2));
  act(() => subscription(3));

  expect(testInstance?.findByType(Inner).props.value).toEqual(0);

  act(() => testRenderer?.update(<Container freeze={false} />));
  expect(testInstance?.findByType(Inner).props.value).toEqual(3);
  expect(renderCount).toBe(2);
});
