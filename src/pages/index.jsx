import { Helmet } from "react-helmet-async";
import LandingPage from "src/pages/LandingPage.jsx";

export default function IndexPage() {
  return (
    <>
      <Helmet>
        <title>TableBank – Empowering Community Savings</title>
        <meta
          name="description"
          content="Join TableBank to manage your group savings, loans, and meetings with ease."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <LandingPage />
    </>
  );
}
