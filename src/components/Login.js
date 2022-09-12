import React from "react";
import {login, login_keychain} from "../actions/actions"
import {connect} from "react-redux";
import backend from "../api/backend";
const dhive = require('@hivechain/dhive');

class LoginParking extends React.Component {

    state = {username : "", error : "", loginType : ""};
    client = new dhive.Client('https://anyx.io');

    login_hivesigner = () =>
    {
        window.open(process.env.NODE_ENV ===  "production" ? 'https://back.downvotecontrol.com/auth' : "http://localhost:4002/auth",'',' scrollbars=yes,menubar=no,width=447,height=614, resizable=yes,toolbar=no,location=no,status=no')
    };

    display_login_keychain = () =>
    {

        if(window.hive_keychain) {

            let keychain = window.hive_keychain

            keychain.requestHandshake(() => {
                this.setState({loginType :  "keychain"});
            });

        } else {
            this.setState({error : "You do not have hive keychain installed"});
        }
    };


    send_login_token = async () =>
    {

        let keychain = window.hive_keychain;


        let memo = (await backend.post('/auth/keychain/fetch_memo', {username: this.state.username})).data;

        if (memo.status === "ok")
        {
            keychain.requestVerifyKey(this.state.username, memo.message, "Posting", (response) => {
                if (response.success === true)
                {
                    this.props.login_keychain(this.state.username, response.result);
                }
            });
        } else
        {
            this.setState({error : "There was an error with the backend server, please try again"});
        }

    };

    login_keychain = async (event) =>
    {
        event.preventDefault();


        if(window.hive_keychain) {
            let keychain = window.hive_keychain;

            let data = await this.client.database.getAccounts([this.state.username]);
            if (data.length === 1) {

                let auth = data[0].posting.account_auths.filter(el => el[0] === "downvote-tool");

                if (auth.length === 0) {

                    keychain.requestAddAccountAuthority(this.state.username, "downvote-tool", "posting", 1, (response) => {
                        if (response.success === true)
                            this.send_login_token();
                        else
                            this.setState({error : "Keychain error"});
                    });
                } else {
                    this.send_login_token();
                }
            } else
            {
                this.setState({error : "Hive user not found"});
            }
        } else {
            this.setState({error : "You do not have hive keychain installed"});
        }
    };

    render() {

        if (this.state.loginType === "") {
            return (
                <div className="wrapper fadeInDown">
                    <div id="formContent">

                        <div className="fadeIn first">
                            <img src="./hive_symbol.png" alt="hive icon" style={{width: "150px"}}/>
                        </div>

                        <span style={{color : "red"}}>{this.state.error}</span>

                        <button type={"button"} className="btn btn-primary " onClick={this.login_hivesigner} style={{
                            backgroundColor: "white",
                            color: "#999999",
                            width: "235px",
                            marginTop: "20px",
                            border: "1px solid #999999",
                            borderRadius: "0"
                        }}>Log in with hivesigner
                        </button>
                        <button type={"button"} className="btn btn-primary " onClick={this.display_login_keychain} style={{
                            backgroundColor: "white",
                            color: "#999999",
                            width: "235px",
                            marginTop: "20px",
                            border: "1px solid #999999",
                            borderRadius: "0"
                        }}>Log in with keychain
                        </button>


                    </div>
                </div>
            )
        } else if (this.state.loginType === "keychain")
        {
            return (
                <div className="wrapper fadeInDown">
                    <div id="formContent">

                        <div className="fadeIn first">
                            <img src="./hive_symbol.png" alt="hive icon" style={{width: "150px"}}/>
                        </div>

                        <br />
                        <span style={{color : "red"}}>{this.state.error}</span>

                        <form onSubmit={this.login_keychain}>
                        <input type={"text"} placeholder={"Username"} value={this.state.username} onChange={(event) => this.setState({username : event.target.value})} />

                        <button type={"button"} className="btn btn-primary " onClick={this.login_keychain}  style={{
                            backgroundColor: "white",
                            color: "#999999",
                            width: "235px",
                            marginTop: "20px",
                            border: "1px solid #999999",
                            borderRadius: "0"
                        }}>Log in with keychain
                        </button>
                        </form>


                    </div>
                </div>
            )
        }
    }

}


const mapStateToProps = (state) => {
    return {
        logged_user : state.login};
};

export default connect(mapStateToProps, {login, login_keychain})(LoginParking);