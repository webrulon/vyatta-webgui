/*
    Document   : ft_confUserList.js
    Created on : Mar 05, 2009, 3:18:51 PM
    Author     : Kevin.Choi
    Description:
*/

function FT_confUserList(name, callback, busLayer)
{
    this.thisObjName = 'FT_confUserList';
    var thisObj = this;

    /**
     * @param name - name of configuration screens.
     * @param callback - a container callback
     * @param busLayer - business object
     */
    this.constructor = function(name, callback, busLayer)
    {
        FT_confUserList.superclass.constructor(name, callback, busLayer);
    }
    this.constructor(name, callback, busLayer);

    this.f_getConfigurationPage = function()
    {
        return this.f_getNewPanelDiv(this.f_init());
    }

    /**
     * define your column header here....
     */
    this.f_createColumns = function()
    {
        var cols = [];

        cols[0] = this.f_createColumn(g_lang.m_name, 200, 'text', '6');
        cols[1] = this.f_createColumn(g_lang.m_login, 150, 'text', '6');
        cols[2] = this.f_createColumn(g_lang.m_email, 100, 'button', '35');
        cols[3] = this.f_createColumn(g_lang.m_delete, 100, 'button', '35');

        return cols;
    }

    this.f_hideButtons = function()
	{
		thisObj.m_buttons.style.display = 'none';
	}

    this.f_clearViewRow = function()
    {
        thisObj.f_removeDivChildren(thisObj.m_div);
        thisObj.f_removeDivChildren(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_header);
        thisObj.m_div.appendChild(thisObj.m_body);
        thisObj.m_div.appendChild(thisObj.m_buttons);		
    }

    this.f_loadVMData = function()
    {
        var thisObj = this;
        var hd = this.f_createColumns();

        var cb = function(evt)
        {
            g_utils.f_cursorDefault();
            if(evt != undefined && evt.m_objName == 'FT_eventObj')
            {
                if(thisObj.f_isServerError(evt, g_lang.m_ulErrorTitle))
                    return;

                var ul = evt.m_value;

                if(ul != undefined && ul.m_userList != null)
                {
                    thisObj.f_clearViewRow();
                    ul = ul.m_userList;

                    for(var i=0; i<ul.length; i++)
                    {
                        var fName = ul[i].m_last + ' ' + ul[i].m_first;
                        var anchor = thisObj.f_renderAnchor(ul[i].m_user,
                                "f_userListEditUser('" + ul[i].m_user + "')",
                                g_lang.m_ulClick2Edit + " (" + fName + ")");
                        var email = ul[i].m_email != undefined ?
                                thisObj.f_renderAnchorHref(
                                '<img src="' + g_lang.m_imageDir + 'ico_mail.gif">',
                                "mailto:" + ul[i].m_email,
                                g_lang.m_ulSendEmail + fName + ' at ' +
                                ul[i].m_email) : "";

                        var del = g_busObj.f_isDeletableUser(ul[i].m_role) ?
                                thisObj.f_renderButton(
                                'deleteUser', true, "f_userListDeleteUser('" +
                                ul[i].m_user + "')", g_lang.m_ulDeleteUser + 
                                ' (' + fName + ')'):
                                "";
                        var data = [fName, anchor, email, del];

                        var bodyDiv = thisObj.f_createGridRow(hd, data);
                        thisObj.m_body.appendChild(bodyDiv);
                    }

                    thisObj.f_adjustDivPosition(thisObj.m_buttons);
                }
            }
        }

        g_utils.f_cursorWait();
        this.m_busLayer.f_getUserListFromServer(cb);
    }

    this.f_stopLoadVMData = function()
    {
        //this.m_busLayer.f_stopVMRequestThread(this.m_threadId);
        this.m_threadId = null;
    }

    this.f_init = function()
    {
        var hd = this.f_createColumns();
        this.m_header = this.f_createGridHeader(hd);
        this.m_body = this.f_createGridView(hd);
        this.f_loadVMData();

        var btns = [['AddUser', 'f_userListAddUserCallback()', g_lang.m_ulTooltipAddUser]];
        this.m_buttons = this.f_createButtons(btns);
       
        if (g_roleManagerObj.f_isInstaller()) {
			thisObj.f_hideButtons();
		}	   
	   
        return [this.m_header, this.m_body, this.m_buttons];
    }
}
FT_extend(FT_confUserList, FT_confBaseObj);

function f_userListAddUserCallback()
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_ADD_ID);

}

function f_userListEditUser(text)
{
    g_configPanelObj.f_showPage(VYA.FT_CONST.DOM_3_NAV_SUB_USER_UPDATE_ID, text);
}

function f_userListEmail(eAddr)
{

}

function f_handleUserListDeleteUser(e, username)
{
    var cb = function(evt)
    {
        if(evt.f_isError())
        {
            alert('delete error');
        }
        else
            g_configPanelObj.m_activeObj.f_loadVMData();
    }

    if(e.getAttribute('id')== 'ft_popup_message_apply')
        g_busObj.f_deleteUserFromServer(username, cb);
}

function f_userListDeleteUser(username)
{
    g_utils.f_popupMessage(g_lang.m_deleteConfirm + ' (' + username + ') user?',
                'confirm', g_lang.m_ulDeleteHeader, true,
                "f_handleUserListDeleteUser(this, '"+ username + "')");
}