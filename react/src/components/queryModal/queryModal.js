import swal from 'sweetalert2';
import queryModalHTML from '../../utils/queryModalHTML.js'

import './queryModal.css'

// @TODO: look into the built in support for AJAX and chaining modals for stepwise form filling
// @TODO: putting a form here is overextending the use case for sweet alert2. replace with custom built modal.
const queryModal = () => {
    swal({
        titleText: 'Select Options to Build a New Query',
        html: queryModalHTML(),
        width: '70%',
        customClass: 'queryModal',
        showConfirmButton: false
    })
}

export default queryModal