<?php
require_once('../../../lib/Slim-2.1.0/Slim/Slim.php');
require_once('../../../server/php/ClassLoader.php');

use Webservice\OsmHandler;

// Load Slim library
\Slim\Slim::registerAutoloader();
Kort\ClassLoader::registerAutoLoader();

// create Slim app
$app = new \Slim\Slim();

$handler = new OsmHandler();
$osmHandler = function ($type, $id) use ($handler) {
    $handler->getOsmData($type, $id);
};

// define REST resources
$app->get('/:type/:id', $osmHandler);


// start Slim app
$app->run();
