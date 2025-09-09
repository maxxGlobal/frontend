import { useState } from "react";
import type { ReactNode } from "react";
import "./style.css";

type SelectboxProps = {
  datas?: string[];
  className?: string;
  action?: (value: string) => void;
  children?: ({ item }: { item: string }) => ReactNode;
};

export default function Selectbox({
  datas = [],
  className,
  action,
  children,
}: SelectboxProps) {
  const [item, setItem] = useState<string>(datas[0] || "");
  const [toggle, setToggle] = useState<boolean>(false);

  const handler = (_e: React.MouseEvent<HTMLLIElement>, value: string) => {
    if (action) {
      action(value);
    }
    setItem(value);
    setToggle(!toggle);
  };

  return (
    <>
      {datas.length > 0 && (
        <div className={`my-select-box ${className || ""}`}>
          <button
            onClick={() => setToggle(!toggle)}
            type="button"
            className="my-select-box-btn"
          >
            {children ? children({ item }) : <span>{item}</span>}
          </button>
          {toggle && (
            <div
              className="click-away"
              onClick={() => setToggle(!toggle)}
            ></div>
          )}
          <div className={`my-select-box-section ${toggle ? "open" : ""}`}>
            <ul className="list">
              {datas.map((value) => (
                <li
                  className={item === value ? "selected" : ""}
                  key={value}
                  onClick={(e) => handler(e, value)}
                >
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
