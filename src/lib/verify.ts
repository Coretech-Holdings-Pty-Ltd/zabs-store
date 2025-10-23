import { getConfigStatus, isConfigured } from './config';

/**
 * Verify that the Medusa backend connection is properly configured
 */
export async function verifyBackendConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const config = getConfigStatus();

  console.log('🔍 Checking backend configuration...');
  console.log('Configuration Status:', config);

  // Check if all required env vars are set
  if (!config.isFullyConfigured) {
    return {
      success: false,
      message: '❌ Configuration incomplete',
      details: {
        ...config,
        missingKeys: [
          !config.electronicsKeyConfigured && 'VITE_MEDUSA_ELECTRONICS_KEY',
          !config.healthKeyConfigured && 'VITE_MEDUSA_HEALTH_KEY',
        ].filter(Boolean),
      },
    };
  }

  // Test backend connectivity
  try {
    console.log('🌐 Testing backend connection...');
    const response = await fetch(`${config.backendUrl}/health`);
    
    if (!response.ok) {
      return {
        success: false,
        message: `❌ Backend returned ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: `${config.backendUrl}/health`,
        },
      };
    }

    const health = await response.json();
    console.log('✅ Backend is healthy:', health);

    return {
      success: true,
      message: '✅ Backend connection successful',
      details: {
        ...config,
        backendHealth: health,
      },
    };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return {
      success: false,
      message: '❌ Cannot reach backend',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        backendUrl: config.backendUrl,
      },
    };
  }
}

/**
 * Test fetching products from a specific store
 */
export async function testProductFetch(store: 'electronics' | 'health'): Promise<{
  success: boolean;
  message: string;
  count?: number;
}> {
  try {
    console.log(`🧪 Testing ${store} store product fetch...`);
    
    const { fetchProductsByStore } = await import('./api');
    const products = await fetchProductsByStore(store);
    
    console.log(`✅ Fetched ${products.length} products from ${store} store`);
    
    if (products.length === 0) {
      return {
        success: false,
        message: `⚠️ No products found in ${store} store. Check if seed data is loaded in backend.`,
        count: 0,
      };
    }

    return {
      success: true,
      message: `✅ Successfully fetched ${products.length} products from ${store} store`,
      count: products.length,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch ${store} store products:`, error);
    return {
      success: false,
      message: `❌ Error fetching ${store} store products: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Run all verification tests
 */
export async function runAllTests() {
  console.log('🚀 Starting ZABS Online Backend Verification...\n');

  // Test 1: Configuration
  const configTest = await verifyBackendConnection();
  console.log('\n📋 Test 1: Configuration');
  console.log(configTest.message);
  if (!configTest.success) {
    console.log('Details:', configTest.details);
    console.log('\n❌ Configuration test failed. Please fix configuration before continuing.');
    return false;
  }

  // Test 2: Electronics Store
  console.log('\n📋 Test 2: Electronics Store Products');
  const electronicsTest = await testProductFetch('electronics');
  console.log(electronicsTest.message);

  // Test 3: Health Store
  console.log('\n📋 Test 3: Health Store Products');
  const healthTest = await testProductFetch('health');
  console.log(healthTest.message);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Configuration: ${configTest.success ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Electronics Store: ${electronicsTest.success ? 'PASS' : 'FAIL'} (${electronicsTest.count || 0} products)`);
  console.log(`✅ Health Store: ${healthTest.success ? 'PASS' : 'FAIL'} (${healthTest.count || 0} products)`);
  
  const allPassed = configTest.success && electronicsTest.success && healthTest.success;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Your storefront is ready to use.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the details above.');
  }

  console.log('='.repeat(50));
  
  return allPassed;
}
