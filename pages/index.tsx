import { NextPage } from "next";
import dynamic from "next/dynamic";
const SwaggerUI = dynamic(import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

const Swagger: NextPage = () => {
  return <SwaggerUI url="/api/doc.json" />;
};

export default Swagger;
