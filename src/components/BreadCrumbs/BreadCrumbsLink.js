import React from "react";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import Link from "@mui/material/Link";
import { CssBaseline } from "@mui/material";
import { useHistory } from "react-router";

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer"
}));

export default function BreadCrumbsLink(content) {
  const theme = useTheme();
  const history = useHistory();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StyledLink underline="hover" onClick={() => {
        history.push({ pathname: "/empty" });
        history.replace({ pathname: content.to.pathname });
      }}>
        {content.children}
      </StyledLink>
    </ThemeProvider>
  );
}
