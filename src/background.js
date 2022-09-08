function checkCookie(url, name) {
    return new Promise((resolve, reject) => {
        chrome.cookies.get({
            url: url,
            name: name
        },
        (cookie) => {
            if (cookie) {
                resolve(cookie.value)
            }
            else {
                reject(0);
            }
        })
    });
}

//Send a basic request to find all the cookies
const sendRequests = () => {
    return jQuery.get('https://sies.uniovi.es/serviciosacademicos/web/expedientes/calendario.xhtml');
};

//Send a second request to extract the array of events
const sendRequestsTwo = (source, view, submit) => {
    var body_payload= `javax.faces.partial.ajax=true&javax.faces.source=${source}&javax.faces.partial.execute=${source}&javax.faces.partial.render=${source}&${source}=${source}&${source}_start=1630886400000&${source}_end=1652054400000&${submit}_SUBMIT=1&javax.faces.ViewState=${view}`;
    return jQuery.post({
        url: 'https://sies.uniovi.es/serviciosacademicos/web/expedientes/calendario.xhtml',
        data: body_payload,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    });
};

async function doTheWork() {
    var request = await sendRequests();

    //Collect all the in-document cookies
    var source = 'j_id' + (request.split('<div id="j_id')[1]).split('"')[0];
    var viewstate = (request.split(':javax.faces.ViewState:1" value="')[1]).split('"')[0];
    var submit = (request.split('" method="post" action="/serviciosacademicos/web/expedientes/calendario.xhtml"')[0]).split('j_id');
    submit = 'j_id' + submit[submit.length - 1];
    viewstate = viewstate.replaceAll("+", "%2B");

    var response = await sendRequestsTwo(source, viewstate, submit);

    //Get and parse the JSON entries
    var entry = jQuery(response).find('update').get(0).textContent;
    var calendarJson = JSON.parse(entry);

    //Start creating the csv from the JSON
    var csvString = 'Asunto,Fecha de comienzo,Comienzo,Fecha de finalización,Finalización,Todo el dí­a,Reminder on/off,Reminder Date,Reminder Time,Meeting Organizer,Required Attendees,Optional Attendees,Recursos de la reuniÃƒÂ³n,Billing Information,Categories,Description,Location,Mileage,Priority,Private,Sensitivity,Show time as\n';

    //Iterate all the array
    for(let i = 0; i < calendarJson.events.length; i++) {
        //Parse the data
        var startSplitted = calendarJson.events[i].start.split('T');
        var startDate = startSplitted[0];
        var startDateCsv = `${startDate.split('-')[2]}/${startDate.split('-')[1]}/${startDate.split('-')[0]}`;
        var startHour = startSplitted[1].split('+')[0];
        var endDate = calendarJson.events[i].end.split('T')[0];
        var endDateCsv = `${endDate.split('-')[2]}/${endDate.split('-')[1]}/${endDate.split('-')[0]}`;
        var endHour = calendarJson.events[i].end.split('T')[1].split('+')[0];
        var alertHour = `${parseInt(startHour.split(':')[0]) - 1}:${startHour.split(':')[1]}:${startHour.split(':')[2]}`;

        var description = calendarJson.events[i].description.replaceAll('\n', '');

        //And add it to the csv string
        csvString += `${calendarJson.events[i].title},${startDateCsv},${startHour},${endDateCsv},${endHour},FALSO,FALSO,${startDateCsv},${alertHour},Universidad de Oviedo,,,,,,${description},,,Normal,Falso,Normal,2\n`;
    }

    //And return the data from the async funcion
    return csvString;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //Wait until the async function finishes, this is a workaround, i can't await things without an async function
    //And this function cannot be async
    doTheWork().then(sendResponse);

    //Inform to the event that we are not finished yet
    return true;
})
