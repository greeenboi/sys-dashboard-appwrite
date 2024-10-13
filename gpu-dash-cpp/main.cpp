#include <iostream>
#include <windows.h>
#include <dxgi.h>
//#include <dxgi1.h>
#include <d3d12.h>

#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "d3d12.lib")

int main() {
    IDXGIFactory1* factory;
    IDXGIAdapter1* adapter;

    // Create a DXGI factory
    HRESULT hr = CreateDXGIFactory1(IID_PPV_ARGS(&factory));
    if (FAILED(hr)) {
        std::cerr << "Failed to create DXGI factory: 0x" << std::hex << hr << std::endl;
        return 1;
    }

    // Enumerate adapters
    for (UINT i = 0; factory->EnumAdapters1(i, &adapter) != DXGI_ERROR_NOT_FOUND; ++i) {
        // Check if the adapter is a WARP adapter
//        bool is_warp = false;
//        adapter->CheckInterfaceSupport(IID_IDXGIAdapter, &is_warp);
//
//        // Skip WARP adapters
//        if (is_warp) {
//            continue;
//        }

        // Get adapter description
        DXGI_ADAPTER_DESC desc;
        adapter->GetDesc(&desc);

        // Print adapter information
        std::cout << "Adapter: " << desc.Description << std::endl;
        std::cout << "Vendor ID: 0x" << std::hex << desc.VendorId << std::endl;
        std::cout << "Device ID: 0x" << std::hex << desc.DeviceId << std::endl;
        std::cout << "GPU Memory: " << desc.DedicatedVideoMemory / (1024 * 1024) << " MB" << std::endl;
        std::cout << "Shared System Memory: " << desc.SharedSystemMemory / (1024 * 1024) << " MB" << std::endl;

        // Get feature levels supported by the adapter
        D3D_FEATURE_LEVEL feature_levels[] = {
                D3D_FEATURE_LEVEL_12_1,
                D3D_FEATURE_LEVEL_12_0,
                D3D_FEATURE_LEVEL_11_1,
                D3D_FEATURE_LEVEL_11_0,
                D3D_FEATURE_LEVEL_10_1,
                D3D_FEATURE_LEVEL_10_0,
                D3D_FEATURE_LEVEL_9_3,
                D3D_FEATURE_LEVEL_9_2,
                D3D_FEATURE_LEVEL_9_1,
        };

        D3D_FEATURE_LEVEL highest_feature_level;
        ID3D12Device* device;
        for (auto level : feature_levels) {
            hr = D3D12CreateDevice(adapter, level, IID_PPV_ARGS(&device));
            if (SUCCEEDED(hr)) {
                highest_feature_level = level;
                break;
            }
        }
        if (SUCCEEDED(hr)) {
            std::cout << "Highest Feature Level: " << highest_feature_level << std::endl;
        } else {
            std::cerr << "Failed to create D3D12 device: 0x" << std::hex << hr << std::endl;
        }

        // Check for 3D capabilities
        D3D12_FEATURE_DATA_D3D12_OPTIONS options;
        hr = device->CheckFeatureSupport(D3D12_FEATURE_D3D12_OPTIONS, &options, sizeof(options));
        if (SUCCEEDED(hr)) {
            if (options.ResourceBindingTier != D3D12_RESOURCE_BINDING_TIER_1) {
                std::cout << "3D Engine: Supports resource binding tier above 1" << std::endl;
            } else {
                std::cout << "3D Engine: Does not support resource binding tier above 1" << std::endl;
            }
        } else {
            std::cerr << "Failed to check 3D capabilities: 0x" << std::hex << hr << std::endl;
        }

        // Check for compute capabilities
        D3D12_FEATURE_DATA_ARCHITECTURE1 arch1;
        hr = device->CheckFeatureSupport(D3D12_FEATURE_ARCHITECTURE1, &arch1, sizeof(arch1));
        if (SUCCEEDED(hr)) {
            if (arch1.TileBasedRenderer) {
                std::cout << "Compute Engine: Supports wave operations" << std::endl;
            } else {
                std::cout << "Compute Engine: Does not support wave operations" << std::endl;
            }
        } else {
            std::cerr << "Failed to check compute capabilities: 0x" << std::hex << hr << std::endl;
        }


        adapter->Release();
    }

    factory->Release();

    return 0;
}