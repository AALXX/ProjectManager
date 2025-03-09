export interface IProjectConfig {
    services: Array<{
        id: number;
        name: string;
        dir: string;
        setup?: Array<{ run: string }>;
        'start-command': string;
        port?: number;
    }>;
    deployments: Array<{
        id: number;
        name: string;
        type: eDeploymentType;
        server: string;
        'docker-compose-file'?: string;
    }>;
}

export enum eDeploymentType {
    DOCKER_COMPOSE = 'docker-compose',
    DOCKER_SWARM = 'docker-swarm',
    KUBERNETES = 'kubernetes',
    
}

export interface IProjectsDb {
    ProjectName: string;
    ProjectToken: string;
    ProjectOwnerToken: string;
    Status: string;
}
