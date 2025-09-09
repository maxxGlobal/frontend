import type { ReactNode } from "react";

type DataIterationProps<T> = {
  datas?: T[];
  startLength: number;
  endLength: number;
  children: ({ datas }: { datas: T }) => ReactNode;
};

function DataIteration<T>({
  datas = [],
  startLength,
  endLength,
  children,
}: DataIterationProps<T>) {
  return (
    <>
      {datas &&
        datas.length >= endLength &&
        datas
          .slice(startLength, endLength)
          .map((value) => (
            <div key={JSON.stringify(value)}>{children({ datas: value })}</div>
          ))}
    </>
  );
}

export default DataIteration;
