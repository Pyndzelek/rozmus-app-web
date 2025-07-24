import React from "react";
import { RingLoader } from "react-spinners";

export default function loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <RingLoader />
    </div>
  );
}
