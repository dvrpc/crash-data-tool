import swal from 'sweetalert2';
import queryModalHTML from '../../utils/queryModalHTML.js'

import './queryModal.css'

// @TODO: look into the built in support for AJAX and chaining modals for stepwise form filling
const queryModal = () => {
    swal({
        titleText: 'Select Options to Build a New Query',
        html: queryModalHTML(),
        width: '80%',
        confirmButtonText: 'submit query',
        customClass: 'queryModal'
    })
}

export default queryModal