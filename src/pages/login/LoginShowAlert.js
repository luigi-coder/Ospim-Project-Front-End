import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import imgLogo from "../../assets/logo.svg";

export const showSwalSuccess = (message) => {
    withReactContent(Swal).fire({
      html: `
            <div 
            style="
              color:#fff; 
              font-size: 26px; 
              display: flex; 
              flex-direction:column;
              height:300px;
              align-items: center;
              justify-content: center;"
              >
              <img style="height:100px; width: 100px; margin: 10px auto;" src=${imgLogo}>
              <h2>${message}</h2>
            </div>
        `,
      timer: 2000,
      background: "rgba(26, 118, 210, 0.8)",
      showConfirmButton: false,
    });
  };