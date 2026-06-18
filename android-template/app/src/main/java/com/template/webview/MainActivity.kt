package com.template.webview

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.net.http.SslError
import android.webkit.*
import android.webkit.WebChromeClient.FileChooserParams
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    
    companion object {
        private const val PERMISSION_REQUEST_CODE = 100
        private const val TARGET_URL = "{{TARGET_URL}}" // Will be replaced by build script
    }

    // Modern file picker launcher
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data: Intent? = result.data
            val results = when {
                data?.data != null -> arrayOf(data.data!!)
                data?.clipData != null -> {
                    val clipData = data.clipData!!
                    Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
                }
                else -> null
            }
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Enable edge-to-edge immersive mode
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowInsetsControllerCompat(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        webView = WebView(this)
        setContentView(webView)

        // Configure WebView with production-ready settings
        configureWebView()
        
        // Load the target URL
        if (TARGET_URL.startsWith("https://")) {
            webView.loadUrl(TARGET_URL)
        } else {
            showError("Invalid URL: Only HTTPS URLs are supported")
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        webView.settings.apply {
            // JavaScript and DOM Storage
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            
            // Caching
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // Viewport and Rendering
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            
            // Media and Content
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false // Security: Prevent file:// access
            allowContentAccess = true
            
            // Modern WebView features
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }
            
            // Mixed content (only allow HTTPS)
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            
            // User Agent
            userAgentString = userAgentString + " WebViewApp/1.0"
        }

        // Hardware Acceleration
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null)

        // WebViewClient for URL handling
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                
                // Only allow HTTPS URLs
                return if (url.startsWith("https://")) {
                    view?.loadUrl(url)
                    false
                } else if (url.startsWith("http://")) {
                    Toast.makeText(this@MainActivity, "HTTP not allowed. Use HTTPS.", Toast.LENGTH_SHORT).show()
                    true
                } else {
                    // Handle external links (tel:, mailto:, etc.)
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                    } catch (e: Exception) {
                        Toast.makeText(this@MainActivity, "Cannot open: $url", Toast.LENGTH_SHORT).show()
                    }
                    true
                }
            }

            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                // Production: DO NOT proceed on SSL errors
                handler?.cancel()
                Toast.makeText(this@MainActivity, "SSL Error: Connection not secure", Toast.LENGTH_LONG).show()
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    if (request?.isForMainFrame == true) {
                        showError("Failed to load page: ${error?.description}")
                    }
                }
            }
        }

        // WebChromeClient for advanced features
        webView.webChromeClient = object : WebChromeClient() {
            
            // File upload handling with permissions
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                // Check and request permissions
                if (!hasStoragePermission()) {
                    requestStoragePermission()
                    return true
                }

                // Launch file picker
                launchFilePicker(fileChooserParams)
                return true
            }

            // Progress updates
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                // Could implement a progress bar here
                super.onProgressChanged(view, newProgress)
            }

            // Console messages for debugging
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    android.util.Log.d("WebView", "${it.message()} -- From line ${it.lineNumber()} of ${it.sourceId()}")
                }
                return true
            }

            // Geolocation permission (if needed)
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }
        }
    }

    private fun launchFilePicker(params: FileChooserParams?) {
        try {
            val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "*/*"
                addCategory(Intent.CATEGORY_OPENABLE)
                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
            }
            
            filePickerLauncher.launch(Intent.createChooser(intent, "Select File"))
        } catch (e: Exception) {
            Toast.makeText(this, "Cannot open file picker: ${e.message}", Toast.LENGTH_SHORT).show()
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = null
        }
    }

    private fun hasStoragePermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            // Android 13+ uses granular permissions
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_MEDIA_IMAGES
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.READ_EXTERNAL_STORAGE
            ) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun requestStoragePermission() {
        val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.CAMERA
            )
        } else {
            arrayOf(
                Manifest.permission.READ_EXTERNAL_STORAGE,
                Manifest.permission.CAMERA
            )
        }
        
        ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, user can retry file upload
                Toast.makeText(this, "Permission granted. Please try again.", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(this, "Permission denied. File upload unavailable.", Toast.LENGTH_SHORT).show()
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = null
            }
        }
    }

    // Native back button handling
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onDestroy() {
        super.onDestroy()
        webView.destroy()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        // Could load an error page here
        webView.loadData(
            """
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: sans-serif; 
                        padding: 20px; 
                        text-align: center;
                        background: #f5f5f5;
                    }
                    .error {
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { color: #e53935; }
                    p { color: #666; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>⚠️ Error</h1>
                    <p>$message</p>
                </div>
            </body>
            </html>
            """.trimIndent(),
            "text/html",
            "UTF-8"
        )
    }
}
