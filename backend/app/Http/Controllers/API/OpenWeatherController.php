<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OpenWeatherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    /**
     * Get the geocode data from OpenWeather API.
     */
    public function getGeocode(Request $request)
    {
        $limit=5;
        if(!$request->has("q")){
            return response()->json(['error' => 'Query parameter "q" is required.'], 400);
        }
        if($request->has("limit")){
            $limit=$request->get("limit");
        }
        $query=$request->get("q");
        $api_key=env('OPEN_WEATHER_API_KEY');
        $response = Http::get("http://api.openweathermap.org/geo/1.0/direct?q=".$query."&limit=".$limit."&appid=".$api_key);
        return $response->json();

    }
    /**
     * Get the weather data from OpenWeather API using longitude and latitude.
     */
    public function getWeather(Request $request)
    {
        if(!$request->has("lat") || !$request->has("lon")){
            return response()->json(['error' => 'Latitude and Longitude parameters are required.'], 400);
        }
        $lat=$request->get("lat");
        $lon=$request->get("lon");
        $api_key=env('OPEN_WEATHER_API_KEY');
        $response = Http::get("https://api.openweathermap.org/data/3.0/onecall?lat=".$lat."&lon=".$lon."&appid=".$api_key."&exclude=minutely,hourly");
        return $response->json();
    }
    /**
     * Get the weather data from OpenWeather API using forecast.
     */
    public function getForecast(Request $request)
    {
        if(!$request->has("lat") || !$request->has("lon")){
            return response()->json(['error' => 'Latitude and Longitude parameters are required.'], 400);
        }
        if(!$request->has("period")) {
           return response()->json(['error' => 'Period parameter is required.'], 400);
        }
        $period=strtolower($request->get("period"));
        if($period!="hourly" && $period!="daily"){
            return response()->json(['error' => 'Period parameter must be either "hourly" or "daily".'], 400);
        }
        $lat=$request->get("lat");
        $lon=$request->get("lon");
        $api_key=env('OPEN_WEATHER_API_KEY');

        if($period=="hourly"){
            $response = Http::get("https://api.openweathermap.org/data/3.0/onecall?lat=".$lat."&lon=".$lon."&appid=".$api_key."&exclude=daily,minutely,current");
            return $response->json();
        }elseif($period=="daily"){
            $response = Http::get("https://api.openweathermap.org/data/3.0/onecall?lat=".$lat."&lon=".$lon."&appid=".$api_key."&exclude=hourly,minutely,current");
            return $response->json();
        }
        return response()->json(['error' => 'Invalid period parameter.'], 400);
    }

}
