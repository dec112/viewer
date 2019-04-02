class CredentialService {

    static INSTANCE = new CredentialService();

    static getInstance() {
        return CredentialService.INSTANCE;
    }

    isValidLogin(credential) {
        var d = new Date();
        var sum = d.getHours() + d.getMinutes();
        
        return credential === `${String.fromCharCode(parseInt('50', 16))}${sum}${String.fromCharCode(parseInt('2E', 16))}`;
    }
}

export default CredentialService;
