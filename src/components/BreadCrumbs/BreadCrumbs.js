import React from "react";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CssBaseline } from "@mui/material";
import { styled } from "@mui/system";
import MuiBreadcrumbs from "@mui/material/Breadcrumbs";
import MuiTypography from "@mui/material/Typography";
import * as Solid from "@fortawesome/free-solid-svg-icons";
import BreadCrumbsLink from "./BreadCrumbsLink";

const Breadcrumbs = styled(MuiBreadcrumbs)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.breadcrumbs.past,
  padding: ".35rem 1rem",
  width: "fit-content",
  borderRadius: "5px",
  marginBottom: ".75rem",
}));

const BreadCrumbsText = styled(MuiTypography)(({ theme }) => ({
  color: theme.palette.breadcrumbs.current,
  cursor: "not-allowed",
}));

export default function BreadCrumbs(props) {
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Breadcrumbs
        separator={
          <FontAwesomeIcon
            icon={Solid.faChevronRight}
            color={theme.palette.primary.text}
          />
        }
        aria-label="breadcrumb"
      >
        {props.crumbs.past.map((el, index) => {
          return (
            <BreadCrumbsLink key={index} to={{ pathname: el.path }}>
              {el.label}
            </BreadCrumbsLink>
          );
        })}
        <BreadCrumbsText>{props.crumbs.current}</BreadCrumbsText>
      </Breadcrumbs>
    </ThemeProvider>
  );
}
