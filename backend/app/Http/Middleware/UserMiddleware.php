<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UserMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            return $next($request);
        }
        
        return response()->json(['message' => 'Unauthorized'], 401);
    }
}