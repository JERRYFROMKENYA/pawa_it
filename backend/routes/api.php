<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\API\OpenWeatherController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');




Route::get('/api', function () {
    return response()->json(['message' => 'Hello, API!']);
});




Route::get('/get-geocode', function (Request $request) {

    $weatherController = new OpenWeatherController();
    $data= $weatherController->getGeocode($request);
    return response()->json($data);
});

Route::get('/get-weather', function (Request $request) {

    $weatherController = new OpenWeatherController();
    $data= $weatherController->getWeather($request);
    return response()->json($data);
});

Route::get('/get-forecast', function (Request $request) {

    $weatherController = new OpenWeatherController();
    $data= $weatherController->getForecast($request);
    return response()->json($data);
});
