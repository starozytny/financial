import "../../css/pages/homepage.scss";

const routes = require('@publicFolder/js/fos_js_routes.json');
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min';

import React from 'react';
import { render } from 'react-dom';
import { Planning }   from "@userPages/components/Budget/Planning/Planning";
import { Categories } from "@userPages/components/Budget/Category/Categories";

Routing.setRoutingData(routes);

const planning = document.getElementById("planning");
if(planning){
    render(<Planning {...planning.dataset} />, planning)
}

const cat = document.getElementById("categories");
if(cat){
    render(<Categories {...cat.dataset} />, cat)
}