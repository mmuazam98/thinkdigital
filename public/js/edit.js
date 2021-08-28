const editDetailsTab = document.querySelector("#edit-details-tab");
const editPasswordTab = document.querySelector("#edit-password-tab");
const editDetailsContainer = document.querySelector("#edit-details-container");
const editPasswordContainer = document.querySelector("#edit-password-container");
const editDetailsForm = document.querySelector("#edit-details-form");
const editPasswordForm = document.querySelector("#edit-password-form");
const editDetailsInputs = document.querySelectorAll("#edit-details-form input");


const editNameInput = document.querySelector("#edit-name");
const editUserNameInput = document.querySelector("#edit-username");
const editEmailInput = document.querySelector("#edit-email");
const editDetailsPasswordInput = document.querySelector("#edit-details-password");

const OldPasswordInput = document.querySelector("#edit-password-old");
const NewPasswordInput = document.querySelector("#edit-password-new");

const successAlert = document.querySelector("#success");
const failureAlert = document.querySelector("#not-success");

const errorUserName = document.querySelector("#username-error");
const errorEmail = document.querySelector("#email-error");
const passwordError = document.querySelector("#password-error")

let changeFor = 0;
let isSaved = 0;
//changeFor = 0; change details 
//else is 1, then change password

const hideAllComponents = () => {
    editDetailsContainer.style.display = "none";
    editPasswordContainer.style.display = "none";
};

const clearInputError = () => {
    editUserNameInput.style.border = "";
    editEmailInput.style.border = "";
    editDetailsPasswordInput.style.border = "";
    errorUserName.classList.remove("form-error-out");
    errorEmail.classList.remove("form-error-out");
    passwordError.classList.remove("form-error-out");
    NewPasswordInput.style.border = ""
}

const hideModal = () => {
    successAlert.style.display = "none";
    failureAlert.style.display = "none";
}


    const showComponent = () => {
        const location = window.location.search.split("=")[1];
        hideAllComponents();
        if (location === "password") {
          editPasswordTab.classList.add("active");
          editPasswordContainer.style.display = "";
        } else {
          editDetailsTab.classList.add("active");
          editDetailsContainer.style.display = "";
        }
    };
    
    let timeout = null;
    editDetailsInputs.forEach((input, index) => {
        let name= username= email = password= newPassword = "";
        input.addEventListener("keyup", () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if(index == 0) name = input.value;
                if(index == 1) username = input.value;
                if(index == 2) email = input.value;
                // console.table({name, username, email});
                let data = {name, username, email, password, newPassword, changeFor, isSaved}
                try {
                    const response = await axios.post(`/users/${loggedInUser}/edit`, {data});
                    let check = response.data.check;
                    clearInputError();
                    if(check.username == true){ 
                        editUserNameInput.style.border = "solid red"
                        errorUserName.classList.add("form-error-out");
                };
                    if(check.email == true) {
                        editEmailInput.style.border = "solid red";
                        errorEmail.classList.add("form-error-out");
                }
                } catch (error) {
                    console.log(error);
                }
            }, 300)
        })
    })
    
    editDetailsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideModal();
        let name = editNameInput.value;
        let username = editUserNameInput.value;
        let email = editEmailInput.value;
        let password = editDetailsPasswordInput.value;
        let newPassword = "";
        let data = {name, username, email, password, email, newPassword, changeFor, isSaved: 1};
        try {
            const response = await axios.post(`/users/${loggedInUser}/edit`, {data});
            console.log(response);
            if(response.status == 200) {
                successAlert.style.display = "block";
                setTimeout(() => {
                    window.location.href = `/users/${loggedInUser}#${name},${username},editTrue`
                }, 1500)
            }
        } catch (error) {
            failureAlert.style.display = "block";  
            console.log(error);
        }
    });
    
    NewPasswordInput.addEventListener("keyup", (e) => {
        clearInputError();
        if(OldPasswordInput.value == e.target.value){
            NewPasswordInput.style.border = "solid red"
            passwordError.classList.add("form-error-out")
        }
    })
    
    editPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        changeFor= 1;
        let name= email = username = "";
        let password = OldPasswordInput.value;
        let newPassword = NewPasswordInput.value;
    
        let data = {name, username, email, password, email, newPassword, changeFor, isSaved: 1};
        
        try {
            const response = await axios.post(`/users/${loggedInUser}/edit`, {data});
            console.log(response);
            if(response.status == 200) {
                successAlert.style.display = "block";
                setTimeout(() => {
                    window.location.href = `/users/${loggedInUser}`
                }, 1500)
            }
        } catch (error) {
            failureAlert.style.display = "block";  
            console.log(error);
        }
    
    })
    


document.addEventListener("DOMContentLoaded", showComponent);
