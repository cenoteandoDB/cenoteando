<?php
namespace FileRun;

class UserGuestsNotifications {

	static $error = false;
	static $tpl;
	static $mail;

	static function getError() {
		$error = self::$error;
		self::$error = false;
		return $error;
	}

	private static function getTemplate() {
		if (!self::$tpl) {
			self::$tpl = Notifications\Templates::parse("guest_account_notification", ['From', 'FromName', 'BCC', 'Subject', 'Body']);
		}
		return self::$tpl;
	}

	private static function getMailer() {
		if (!self::$mail) {
			self::$mail = new Utils\Email;
		}
		return self::$mail;
	}

	static function notifyNew($userInfo) {
		global $auth;
		$tpl = self::getTemplate();

		$smarty = \FileRun::getSmarty();
		$auth->currentUserInfo['fullName'] = Users::formatFullName($auth->currentUserInfo);
		$smarty->assign("creatorUserInfo", $auth->currentUserInfo);
		$smarty->assign("userInfo", $userInfo);
		$smarty->assign('access_url', UserGuests::getGuestAccessURL($userInfo['id']));

		$from = $smarty->fetch("string:".$tpl['From']);
		$fromName = $smarty->fetch("string:".$tpl['FromName']);
		$subject = $smarty->fetch("string:".$tpl['Subject']);
		$body = $smarty->fetch("string:".$tpl['Body']);

		if (\FileRun::isFree()) {
			$body .= '<div style="margin:10px 0;font-size:11px;color:gray;">Sent from my website using FileRun</div>';
		}

		$mail = self::getMailer();
		$mail->setFrom($from, $fromName);
		$mail->Subject = $subject;
		$mail->Body = $body;
		if (strlen($tpl['BCC']) > 3) {
			$mail->addBCC($tpl['BCC']);
		}
		$mail->addAddress($userInfo['email']);
		return @$mail->send();
	}
}