<?php
$to = "seed13@seed13productions.com";
$subject = "New Custom Request from Seed 13 Productions";
$headers = "From: " . $_POST['email'] . "\r\n";
$headers .= "Reply-To: " . $_POST['email'] . "\r\n";

$style = htmlspecialchars($_POST['style']);
$custom = htmlspecialchars($_POST['custom']);
$email = htmlspecialchars($_POST['email']);

$body = "You have a new custom order request:\n\n";
$body .= "Email: $email\n";
$body .= "Selected Style: $style\n";
$body .= "Custom Notes: $custom\n\n";

// File handling
$uploadDir = "uploads/";
$attachments = [];

if (!file_exists($uploadDir)) {
  mkdir($uploadDir, 0775, true);
}

foreach ($_FILES['images']['tmp_name'] as $index => $tmpName) {
  if ($_FILES['images']['error'][$index] === UPLOAD_ERR_OK) {
    $name = basename($_FILES['images']['name'][$index]);
    $target = $uploadDir . uniqid() . "_" . $name;
    if (move_uploaded_file($tmpName, $target)) {
      $attachments[] = $target;
      $body .= "Uploaded Image: $target\n";
    }
  }
}

mail($to, $subject, $body, $headers);
header("Location: thank-you.html");
exit;
?>
