<?php

namespace League\OAuth2\Server\TokenType;

use Symfony\Component\HttpFoundation\Request;

class Bearer extends AbstractTokenType implements TokenTypeInterface
{
    /**
     * {@inheritdoc}
     */
    public function generateResponse()
    {
        $return = array(
            'access_token'  =>  $this->getParam('access_token'),
            'token_type'    =>  'Bearer',
            'expires_in'    =>  $this->getParam('expires_in')
        );

        if (!is_null($this->getParam('refresh_token'))) {
            $return['refresh_token'] = $this->getParam('refresh_token');
        }

        return $return;
    }

    /**
     * {@inheritdoc}
     */
    public function determineAccessTokenInHeader(Request $request)
    {
	    if ($request->headers->has('Authorization')) {
		    $header = $request->headers->get('Authorization');
	    } else {
		    if (!function_exists('apache_request_headers')) {return;}
		    $h = apache_request_headers();
		    $header = $h['Authorization'];
	    }
	    if (!$header) {return;}
	    if (substr($header, 0, 7) !== 'Bearer ') {return;}
	    return trim(substr($header, 7));
    }
}
