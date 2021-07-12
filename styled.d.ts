// import original module declaration
import "styled-components";

// and extend it
declare module "styled-components" {
  export interface DefaultTheme {
    borderRadius: string;

    colors: {
      primary: string;
      accent: string;
      dark: string;
      background: string;
    };
  }
}
