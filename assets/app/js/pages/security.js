import '../../css/pages/security.scss';

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min';

import React from 'react';
import { render } from 'react-dom';
import { Forget } from './components/Security/Forget';
import { Reinit } from './components/Security/Reinit';
import {UserFormulaire} from "@dashboardPages/components/User/UserForm";

Routing.setRoutingData(routes);

let el = document.getElementById("forget");
if(el){
    render(<Forget />, el)
}

el = document.getElementById("reinit");
if(el){
    render(<Reinit {...el.dataset} />, el)
}

el = document.getElementById("user-registration");
if(el){
    render(<>
        <UserFormulaire type="create" roles={["ROLE_USER"]} isRegistration={true} />
    </>, el)
}

let btnSeePassword = document.querySelector('.btn-see-password');
if(btnSeePassword){
    let seePassword = false;
    let inputSeePassword = document.querySelector('#inputPassword');
    btnSeePassword.addEventListener('click', function (e){
        if(seePassword){
            seePassword = false;
            inputSeePassword.type = "password";
            btnSeePassword.classList.remove("active");
        }else{
            seePassword = true;
            inputSeePassword.type = "text";
            btnSeePassword.classList.add("active");
        }
    })
}