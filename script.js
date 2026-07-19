let map;
let studentMarker;
let schoolMarker;
let circle;

let studentPos;
let schoolPos;

let placesService;
let schoolMarkers = [];

let excludedPlaceIds = [];

let schoolLabels = [];

let targetSchoolPlaceId = null;

let customerNumber = "";
let studentGender = "";
let schoolNamesVisible = true;

// ---------------- CUSTOM SCHOOL LIST ----------------
const customSchoolList = [
    { id: 0,  lat: 6.994635174825783, lng: 80.01746318079749, name: "Udupila Primary School" },
    { id: 1,  lat: 6.983518221103399, lng: 80.02132481888104, name: "Kanduboda Primary School" },
    { id: 2,  lat: 6.980351873877105, lng: 80.01050431518179, name: "Siyambalapewatta Primary School" },
    { id: 3,  lat: 6.98949511714975,  lng: 80.00486878025154, name: "Sri Rajasinghe Primary School" },
    { id: 4,  lat: 6.968105821646406, lng: 80.00117916449963, name: "Yatihena Government School" },
    { id: 5,  lat: 6.997718576182054, lng: 79.98856174154979, name: "SKK Suriarachchi Primary School" },
    { id: 6,  lat: 6.98246890464621,  lng: 79.98580407180006, name: "Daranagama Primary School" },
    { id: 7,  lat: 6.963888468971635, lng: 79.98774284179764, name: "Kandewatta Siri Sumana Vidyalaya" },
    { id: 8,  lat: 6.96699292385619,  lng: 79.9782754398691,  name: "Sri Sangamiththa Vidyalaya" },
    { id: 9,  lat: 7.000526097123138, lng: 79.95337446706961, name: "Baptist Primary Vidyalaya" },
    { id: 10, lat: 7.0022602670911525, lng: 79.958393180104,  name: "Puwakwetiya Vidyalaya" },
    { id: 11, lat: 6.99814461154881,  lng: 79.96942271901023, name: "Pemananda Vidyalaya" },
    { id: 12, lat: 6.97149999123592,  lng: 79.954849107753,   name: "Sapugaskanda Vishaka Balika Vidyalaya" },
    { id: 13, lat: 6.974357120489106, lng: 79.95293204566329, name: "Sapugaskanda Sobitha Vidyalaya" }
];

// ---------------- INIT MAP ----------------
function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 6.9271, lng: 79.8612 },
        zoom: 12
    });

    placesService = new google.maps.places.PlacesService(map);
}

window.onload = initMap;

// ---------------- GEOCODE ----------------
function geocode(address, callback) {

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {

        if (status === "OK") {
            const loc = results[0].geometry.location;

            callback({
                lat: loc.lat(),
                lng: loc.lng()
            });
        } else {
            alert("Location not found");
        }
    });
}

// ---------------- STUDENT ----------------
function searchStudent() {

    const address = document.getElementById("studentAddress").value;

    geocode(address, (pos) => {

        studentPos = pos;

        if (studentMarker) studentMarker.setMap(null);

        studentMarker = new google.maps.Marker({
            position: pos,
            map,
            label: {
                text: "STUDENT",
                color: "black",
                fontWeight: "bold"
            },
            draggable: true,
            zIndex: 1000
        });

        map.setCenter(pos);
        map.setZoom(15);
    });
}

// ---------------- SCHOOL AUTOCOMPLETE (from custom list) ----------------
function filterSchoolDropdown() {

    const input = document.getElementById("schoolAddress");
    const dropdown = document.getElementById("schoolDropdown");
    const query = input.value.trim().toLowerCase();

    if (!query) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
        return;
    }

    const matches = customSchoolList.filter(school =>
        school.name.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        dropdown.style.display = "none";
        dropdown.innerHTML = "";
        return;
    }

    dropdown.innerHTML = matches
        .map(school => `<div onclick="selectSchoolFromDropdown(${school.id})">${school.name}</div>`)
        .join("");

    dropdown.style.display = "block";
}

function selectSchoolFromDropdown(schoolId) {

    const school = customSchoolList.find(s => s.id === schoolId);
    if (!school) return;

    document.getElementById("schoolAddress").value = school.name;
    document.getElementById("schoolDropdown").style.display = "none";

    schoolPos = { lat: school.lat, lng: school.lng };
    targetSchoolPlaceId = null;

    if (schoolMarker) schoolMarker.setMap(null);

    schoolMarker = new google.maps.Marker({
        position: schoolPos,
        map,
        icon: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        label: {
            text: school.name,
            color: "black",
            fontWeight: "bold"
        },
        draggable: true,
        zIndex: 999
    });

    map.setCenter(schoolPos);
    map.setZoom(15);
}

document.addEventListener("click", function (e) {
    const wrapper = document.getElementById("schoolAddress").parentElement;
    if (!wrapper.contains(e.target)) {
        document.getElementById("schoolDropdown").style.display = "none";
    }
});

// ---------------- CONFIRM POSITIONS ----------------
function confirmStudent() {
    studentPos = {
        lat: studentMarker.getPosition().lat(),
        lng: studentMarker.getPosition().lng()
    };

    showCustomPopup("✅ Student position confirmed");
}

function confirmSchool() {
    schoolPos = {
        lat: schoolMarker.getPosition().lat(),
        lng: schoolMarker.getPosition().lng()
    };

    showCustomPopup("✅ School position confirmed");
}

// ---------------- DISTANCE ----------------
function getDistance(lat1, lng1, lat2, lng2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;

    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) *
        Math.cos(lat2*Math.PI/180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ---------------- ANALYSIS ----------------
function analyze() {

    if (!studentPos || !schoolPos) {
        alert("Confirm both positions first");
        return;
    }

    customerNumber = document.getElementById("customerNumber").value;
    studentGender = document.getElementById("studentGender").value;

    schoolMarkers.forEach(m => m.setMap(null));
    schoolMarkers = [];

    schoolLabels.forEach(label => label.setMap(null));
    schoolLabels = [];

    if (circle) circle.setMap(null);

    const radiusKm = getDistance(
        studentPos.lat,
        studentPos.lng,
        schoolPos.lat,
        schoolPos.lng
    );

    // draw circle — light blue fill, thin sharp black border
    circle = new google.maps.Circle({
        map,
        center: studentPos,
        radius: radiusKm * 1000,
        strokeColor: "#000000",
        strokeOpacity: 1,
        strokeWeight: 1,
        fillColor: "#66b3ff",
        fillOpacity: 0.12
    });

    studentMarker.setZIndex(1000);
    schoolMarker.setZIndex(999);

    filterCustomSchools(radiusKm);
}

// ---------------- FILTER CUSTOM SCHOOL LIST BY DISTANCE ----------------
function filterCustomSchools(radiusKm) {

    const schoolsInsideCircle = customSchoolList.filter(school => {
        const distance = getDistance(
            studentPos.lat,
            studentPos.lng,
            school.lat,
            school.lng
        );

        return distance <= radiusKm;
    });

    const visibleSchools = schoolsInsideCircle.filter(school => {

        if (excludedPlaceIds.includes(school.id)) return false;

        if (studentGender === "girl" && school.id === 13) return false;
        if (studentGender === "boy" && school.id === 12) return false;

        return true;
    });

    document.getElementById("distanceInfo").innerHTML =
        "<b>Distance:</b> " + radiusKm.toFixed(2) + " km" +
        "<br><b>Schools Found:</b> " + visibleSchools.length +
        "<br><b>Customer Number:</b> " + (customerNumber || "--") +
        "<br><b>Student Gender:</b> " + (studentGender ? (studentGender === "boy" ? "Boy" : "Girl") : "--") +
        "<br><b>Student Position:</b> " + studentPos.lat + ", " + studentPos.lng;

    const namesListHtml = visibleSchools.length
        ? "<ul style='margin:4px 0 0 18px; padding:0;'>" +
          visibleSchools.map(s => "<li>" + s.name + "</li>").join("") +
          "</ul>"
        : "<i>No schools in range</i>";

    document.getElementById("schoolNamesList").innerHTML = namesListHtml;
    updateSchoolNamesDisplay();

    visibleSchools.forEach(school => {

        const position = { lat: school.lat, lng: school.lng };

        const marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            zIndex: 500
        });

        marker.addListener("click", () => {

            const remove = confirm(
                `Remove "${school.name}" from the results?`
            );

            if (remove) {

                excludedPlaceIds.push(school.id);

                analyze();
            }
        });

        schoolMarkers.push(marker);

        const label = new google.maps.OverlayView();

        label.onAdd = function () {

            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.background = "white";
            div.style.padding = "2px 5px";
            div.style.border = "1px solid black";
            div.style.fontSize = "12px";
            div.style.fontWeight = "bold";
            div.style.whiteSpace = "nowrap";

            div.innerHTML = school.name;

            this.div = div;

            const panes = this.getPanes();
            panes.overlayLayer.appendChild(div);
        };

        label.draw = function () {

            const projection = this.getProjection();
            const pixelPosition = projection.fromLatLngToDivPixel(
                new google.maps.LatLng(position.lat, position.lng)
            );

            if (this.div) {
                this.div.style.position = "absolute";
                this.div.style.left = pixelPosition.x + "px";
                this.div.style.top = pixelPosition.y + "px";
            }
        };

        label.onRemove = function () {
            if (this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        };

        label.setMap(map);
        schoolLabels.push(label);
    });
}

// ---------------- SHOW/HIDE SCHOOL NAMES LIST ----------------
function toggleSchoolNames() {
    schoolNamesVisible = !schoolNamesVisible;
    updateSchoolNamesDisplay();
}

function updateSchoolNamesDisplay() {
    const box = document.getElementById("schoolNamesList");
    const btn = document.getElementById("toggleNamesBtn");

    box.style.display = schoolNamesVisible ? "block" : "none";
    btn.innerText = schoolNamesVisible ? "Hide School Names" : "Show School Names";
}

function printMap() {
    window.print();
}

// ---------------- PRINT: STABLE, CENTERED, NEVER CROPPED ----------------
// Padding reserved around the fitted circle. "right" is bigger to make
// room for the distance box, so the circle visually centers in the
// remaining left-hand space instead of being centered on the whole page.
const PRINT_FIT_PADDING = { top: 20, right: 300, bottom: 20, left: 20 };

function focusCircleForPrint() {

    if (!circle || !studentPos) {
        // nothing to fit yet — just print whatever is currently shown
        window.print();
        return;
    }

    // 1. Switch the page into its final print layout FIRST.
    //    This changes #map to its full-page print size.
    document.body.classList.add("print-mode");

    // 2. Wait two animation frames so the browser has actually painted
    //    the new layout before we touch the map — this is required for
    //    Google Maps to measure the container correctly.
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            // Tell Google Maps its container size changed.
            google.maps.event.trigger(map, "resize");

            // 3. Now fit the circle to the REAL print-sized container.
            const bounds = circle.getBounds();
            map.fitBounds(bounds, PRINT_FIT_PADDING);

            // 4. Only print once the map has finished settling on the
            //    new bounds/zoom — this is what keeps the circle stable
            //    and fully inside the page every time.
            google.maps.event.addListenerOnce(map, "idle", () => {
                setTimeout(() => {
                    window.print();
                }, 300);
            });
        });
    });
}

// 5. After the print dialog closes, restore the normal on-screen view.
window.addEventListener("afterprint", () => {

    document.body.classList.remove("print-mode");

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            google.maps.event.trigger(map, "resize");

            if (circle) {
                map.fitBounds(circle.getBounds());
            } else if (studentPos) {
                map.setCenter(studentPos);
            }
        });
    });
});

function showCustomPopup(message) {
    document.getElementById("customPopupMessage").innerHTML = message;
    document.getElementById("customPopupOverlay").style.display = "block";
}

function closeCustomPopup() {
    document.getElementById("customPopupOverlay").style.display = "none";
}