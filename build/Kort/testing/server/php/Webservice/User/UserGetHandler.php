<?php
namespace Webservice\User;

use Webservice\DbProxyHandler;

class UserGetHandler extends DbProxyHandler
{
    protected function getTable()
    {
        return 'kort.user_model';
    }

    protected function getFields()
    {
        return array(
            'id',
            'name',
            'username',
            'oauth_user_id',
            'token',
            'fix_count',
            'vote_count',
            'koin_count',
            'secret'
        );
    }

    public function getUserBySecret($secret)
    {
        if (!empty($secret)) {
            $this->getDbProxy()->setWhere("secret = '". $secret . "'");
            $userData = json_decode($this->getDbProxy()->select(), true);
            $userData = $userData[0];

            if(!empty($userData)) {
                if (!isset($_SESSION)) {
                    session_start();
                }
                $_SESSION['secret'] = $secret;
                $_SESSION['user_id'] = $userData['id'];
                $userData['pic_url'] = $this->getGravatarUrl($userData['oauth_user_id']);
                $userData['logged_in'] = true;
                return json_encode($userData);
            }
        }
        return $this->getDefaultUserJson();
    }

    public function getUserByOAuthUserId($oauth_user_id)
    {
        $this->getDbProxy()->setWhere("oauth_user_id = '". $oauth_user_id . "'");

        $userData = json_decode($this->getDbProxy()->select(), true);
        if (count($userData) > 0) {
            $userData = $userData[0];
        }

        return json_encode($userData);
    }

    protected function getDefaultUserJson() {
        $user = array();
        $user['id'] = null;
        $user['name'] = "Anonymous";
        $user['username'] = "";
        $user["email"] = "";
        $user["token"] = "";
        $user["fix_count"] = 0;
        $user["vote_count"] = 0;
        $user["koin_count"] = 0;
        $user["pic_url"] = "";
        $user["logged_in"] = false;
        $user["secret"] = "";

        return json_encode($user);
    }

    /**
    * Get either a Gravatar URL or complete image tag for a specified email address.
    *
    * @param  Size in pixels, defaults to 80px [ 1 - 2048 ]
    * @param  Default imageset to use [ 404 | mm | identicon | monsterid | wavatar ]
    * @param  Maximum rating (inclusive) [ g | pg | r | x ]
    * @return String containing the URL
    * @source http://gravatar.com/site/implement/images/php/
    */
    protected function getGravatarUrl ($email, $sizeInPixel = 200, $imageSet = 'mm', $rating = 'r')
    {
        $url = 'http://www.gravatar.com/avatar/';
        $url .= \md5(\strtolower(\trim($email)));
        $url .= "?s=$sizeInPixel&d=$imageSet&r=$rating";
        return $url;
    }
}