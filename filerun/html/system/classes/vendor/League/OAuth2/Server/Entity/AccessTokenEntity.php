<?php
/**
 * OAuth 2.0 Access token entity
 *
 * @package     league/oauth2-server
 * @author      Alex Bilbie <hello@alexbilbie.com>
 * @copyright   Copyright (c) Alex Bilbie
 * @license     http://mit-license.org/
 * @link        https://github.com/thephpleague/oauth2-server
 */

namespace League\OAuth2\Server\Entity;

/**
 * Access token entity class
 */
class AccessTokenEntity extends AbstractTokenEntity
{
    /**
     * Get session
     *
     * @return \League\OAuth2\Server\Entity\SessionEntity
     */
    public function getSession()
    {
        if ($this->session instanceof SessionEntity) {
            return $this->session;
        }

        $this->session = $this->server->getSessionStorage()->getByAccessToken($this);

        return $this->session;
    }

    /**
     * Check if access token has an associated scope
     *
     * @param mixed $scope Scope id or name to check
     *
     * @return bool
     */
    public function hasScope($scope)
    {
        if ($this->scopes === null) {
            $this->getScopes();
        }
	    if (is_numeric($scope)) {
		    return isset($this->scopes[$scope]);
	    } else {
			foreach($this->scopes as $sc) {
				if ($sc->getScope() == $scope) {
					return true;
				}
			}
	    }
    }

    /**
     * Return all scopes associated with the access token
     *
     * @return \League\OAuth2\Server\Entity\ScopeEntity[]
     */
    public function getScopes()
    {
        if ($this->scopes === null) {
            $this->scopes = $this->formatScopes(
                $this->server->getAccessTokenStorage()->getScopes($this)
            );
        }

        return $this->scopes;
    }

    /**
     * {@inheritdoc}
     */
    public function save()
    {
       $id = $this->server->getAccessTokenStorage()->create(
            $this->getToken(),
            $this->getExpireTime(),
            $this->getSession()->getId(),
	        $this->getDeviceUUID()
        );
	    $this->setId($id);

        // Associate the scope with the token
        foreach ($this->getScopes() as $scope) {
            $this->server->getAccessTokenStorage()->associateScope($this, $scope);
        }

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function expire()
    {
        $this->server->getAccessTokenStorage()->delete($this);
    }
}
