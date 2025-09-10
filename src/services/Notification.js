import Swal from 'sweetalert2';
const Toast_ = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  export const Toast = (icon, title, timer = 1000) => {
    Toast_.fire({
      icon: icon,
      title: title,
      timer: timer,
    });
  };
  