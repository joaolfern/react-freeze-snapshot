import React, { Suspense, Fragment, useRef } from "react";

const infiniteThenable = { then() {} };

function Suspender({
  freeze,
  children,
}: {
  freeze: boolean;
  children: React.ReactNode;
}) {
  if (freeze) {
    throw infiniteThenable;
  }
  return <Fragment>{children}</Fragment>;
}

interface Props {
  freeze: boolean;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  wrapperProps?: Omit<React.HTMLAttributes<HTMLDivElement>, "ref">;
  placeholderProps?: Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "dangerouslySetInnerHTML"
  >;
}

export function Freeze({
  freeze,
  children,
  placeholder,
  wrapperProps,
  placeholderProps,
}: Props) {
  const childrenRef = useRef<HTMLDivElement>(null);

  const finalPlacholder = placeholder || (
    <div
      {...placeholderProps}
      children={null}
      dangerouslySetInnerHTML={{ __html: childrenRef.current?.innerHTML || "" }}
    />
  );

  return (
    <div {...wrapperProps} ref={childrenRef}>
      <Suspense fallback={finalPlacholder}>
        <Suspender freeze={Boolean(freeze)}>{children}</Suspender>
      </Suspense>
    </div>
  );
}
